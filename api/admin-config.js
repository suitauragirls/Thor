import { createClient } from '@supabase/supabase-js';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'sag_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;
const PUBLIC_SETTINGS = new Set([
  'homepageSections',
  'heroConfig',
  'storeSettings',
  'banners',
  'dealOfTheDay',
  'paymentSettings',
]);

const sanitizePublicPaymentSettings = (value) => ({
  mode: value?.mode === 'live' ? 'live' : 'test',
  prepaidOnly: true,
  allowCod: false,
  razorpayKeyIdPlaceholder: typeof value?.razorpayKeyIdPlaceholder === 'string'
    ? value.razorpayKeyIdPlaceholder.trim().slice(0, 160)
    : '',
  enableUpi: Boolean(value?.enableUpi),
  enableCards: Boolean(value?.enableCards),
  enableNetBanking: Boolean(value?.enableNetBanking),
});

const sanitizePublicStoreSettings = (value) => {
  const settings = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const stringFields = [
    'storeName', 'tagline', 'logoText', 'storeEmail', 'phone', 'whatsapp', 'address',
    'instagramUrl', 'facebookUrl', 'twitterUrl', 'currency', 'currencySymbol', 'announcementText',
  ];
  const safe = Object.fromEntries(stringFields.map((key) => [
    key,
    typeof settings[key] === 'string' ? settings[key].trim().slice(0, 500) : '',
  ]));
  safe.shippingCharge = Math.max(0, Number(settings.shippingCharge) || 0);
  safe.freeShippingThreshold = Math.max(0, Number(settings.freeShippingThreshold) || 0);
  safe.announcementActive = settings.announcementActive ?? true;
  return safe;
};

const reply = (res, status, body) => {
  res.status(status)
    .setHeader('Content-Type', 'application/json; charset=utf-8')
    .setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(body));
};

const database = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('SERVER_CONFIG_MISSING');
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

const hashSecret = (value, salt = randomBytes(16)) => {
  const saltHex = salt.toString('hex');
  const hashHex = scryptSync(value, salt, 64).toString('hex');
  return `${saltHex}:${hashHex}`;
};

const verifySecret = (value, stored) => {
  if (!value || !stored) return false;
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(value, Buffer.from(saltHex, 'hex'), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const getCredentials = async (client, bootstrap = false) => {
  const { data, error } = await client
    .from('admin_credentials')
    .select('*')
    .eq('singleton', true)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  if (!bootstrap) return null;

  const username = process.env.ADMIN_INITIAL_USERNAME?.trim();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const pin = process.env.ADMIN_INITIAL_PIN;
  if (!username || !password || !pin) throw new Error('ADMIN_BOOTSTRAP_CONFIG_MISSING');

  const initialCredentials = {
    singleton: true,
    username,
    password_hash: hashSecret(password),
    pin_hash: hashSecret(pin),
    require_pin: true,
    secret_path_slug: 'sag-vault',
    allow_direct_admin_route: false,
    session_version: 1,
  };
  const { data: created, error: createError } = await client
    .from('admin_credentials')
    .upsert(initialCredentials, { onConflict: 'singleton' })
    .select('*')
    .single();
  if (createError) throw createError;
  return created;
};

const signPayload = (payload) => createHmac('sha256', process.env.ADMIN_SESSION_SECRET)
  .update(payload)
  .digest('base64url');

const createSession = (credentials) => {
  const payload = Buffer.from(JSON.stringify({
    username: credentials.username,
    version: credentials.session_version,
    expiresAt: Date.now() + SESSION_SECONDS * 1000,
  })).toString('base64url');
  return `${payload}.${signPayload(payload)}`;
};

const setSessionCookie = (res, token, clear = false) => {
  const secure = process.env.VERCEL === '1' ? '; Secure' : '';
  const maxAge = clear ? 0 : SESSION_SECONDS;
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${clear ? '' : token}; HttpOnly; SameSite=Strict; Path=/api/admin-config; Max-Age=${maxAge}${secure}`);
};

const getCookie = (req, name) => {
  const cookieHeader = req.headers.cookie || '';
  const value = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : '';
};

const authenticate = async (req, client) => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('SERVER_CONFIG_MISSING');
  const token = getCookie(req, COOKIE_NAME);
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(signPayload(payload));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  let session;
  try {
    session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!session.username || session.expiresAt <= Date.now()) return null;

  const credentials = await getCredentials(client);
  if (!credentials || credentials.username !== session.username || credentials.session_version !== session.version) return null;
  return { credentials, session };
};

const ensureSameOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin) return true;
  const requestHost = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
};

const parseBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  let client;
  try {
    client = database();
    const action = req.query?.action;

    if (req.method === 'GET') {
      if (action === 'session') {
        const auth = await authenticate(req, client);
        if (!auth) return reply(res, 401, { error: 'Admin session required.' });
        const { credentials } = auth;
        return reply(res, 200, {
          success: true,
          username: credentials.username,
          sessionVersion: credentials.session_version,
        });
      }

      if (action === 'security') {
        const auth = await authenticate(req, client);
        if (!auth) return reply(res, 401, { error: 'Admin session required.' });
        const { credentials } = auth;
        return reply(res, 200, { securityConfig: {
          adminUsername: credentials.username,
          adminPassword: '',
          securityPin: '',
          requirePin: credentials.require_pin,
          secretPathSlug: credentials.secret_path_slug,
          allowDirectAdminRoute: credentials.allow_direct_admin_route,
          sessionVersion: credentials.session_version,
        } });
      }

      const [settingsResult, paymentResult] = await Promise.all([
        client.from('storefront_settings').select('setting_key,setting_value'),
        client.from('storefront_payment_settings').select('setting_value').eq('singleton', true).maybeSingle(),
      ]);
      if (settingsResult.error) throw settingsResult.error;
      if (paymentResult.error) throw paymentResult.error;
      const settings = Object.fromEntries((settingsResult.data || []).map((row) => [row.setting_key, row.setting_value]));
      if (settings.storeSettings) settings.storeSettings = sanitizePublicStoreSettings(settings.storeSettings);
      if (paymentResult.data?.setting_value) {
        settings.paymentSettings = sanitizePublicPaymentSettings(paymentResult.data.setting_value);
      }
      return reply(res, 200, { settings });
    }

    if (!ensureSameOrigin(req)) return reply(res, 403, { error: 'Cross-origin request rejected.' });
    const body = parseBody(req);

    if (req.method === 'POST' && action === 'login') {
      const credentials = await getCredentials(client, true);
      const usernameMatches = body.username?.trim().toLowerCase() === credentials.username.toLowerCase();
      const passwordMatches = verifySecret(body.password, credentials.password_hash);
      const pinMatches = !credentials.require_pin || verifySecret(body.pin, credentials.pin_hash);
      if (!usernameMatches || !passwordMatches || !pinMatches) {
        return reply(res, 401, { error: 'Invalid admin credentials.' });
      }
      setSessionCookie(res, createSession(credentials));
      return reply(res, 200, { success: true, username: credentials.username, sessionVersion: credentials.session_version });
    }

    if (req.method === 'POST' && action === 'logout') {
      setSessionCookie(res, '', true);
      return reply(res, 200, { success: true });
    }

    if (req.method !== 'PUT') return reply(res, 405, { error: 'Method not allowed.' });

    const auth = await authenticate(req, client);
    if (!auth) return reply(res, 401, { error: 'Admin session required.' });

    if (body.securityConfig) {
      const { securityConfig } = body;
      const current = auth.credentials;
      const password = securityConfig.adminPassword || '';
      const pin = securityConfig.securityPin || '';
      if (password && password.length < 8) return reply(res, 400, { error: 'Password must be at least 8 characters.' });
      if (securityConfig.requirePin && pin && !/^\d{6}$/.test(pin)) return reply(res, 400, { error: 'PIN must be six digits.' });
      const nextCredentials = {
        singleton: true,
        username: securityConfig.adminUsername?.trim() || current.username,
        password_hash: password ? hashSecret(password) : current.password_hash,
        pin_hash: pin ? hashSecret(pin) : current.pin_hash,
        require_pin: securityConfig.requirePin ?? current.require_pin,
        secret_path_slug: securityConfig.secretPathSlug || current.secret_path_slug,
        allow_direct_admin_route: securityConfig.allowDirectAdminRoute ?? current.allow_direct_admin_route,
        session_version: current.session_version + 1,
      };
      const { data, error } = await client.from('admin_credentials').upsert(nextCredentials, { onConflict: 'singleton' }).select('*').single();
      if (error) throw error;
      setSessionCookie(res, createSession(data));
      return reply(res, 200, { success: true, sessionVersion: data.session_version });
    }

    const settings = body.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return reply(res, 400, { error: 'Settings object required.' });
    }
    const entries = Object.entries(settings);
    if (entries.length === 0 || entries.some(([key]) => !PUBLIC_SETTINGS.has(key))) {
      return reply(res, 400, { error: 'Unsupported storefront setting.' });
    }
    const paymentEntry = entries.find(([key]) => key === 'paymentSettings');
    if (paymentEntry) {
      const { error } = await client.from('storefront_payment_settings').upsert({
        singleton: true,
        setting_value: sanitizePublicPaymentSettings(paymentEntry[1]),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'singleton' });
      if (error) throw error;
    }
    const rows = entries.filter(([key]) => key !== 'paymentSettings').map(([setting_key, setting_value]) => ({
      setting_key,
      setting_value: setting_key === 'storeSettings' ? sanitizePublicStoreSettings(setting_value) : setting_value,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length > 0) {
      const { error } = await client.from('storefront_settings').upsert(rows, { onConflict: 'setting_key' });
      if (error) throw error;
    }
    return reply(res, 200, { success: true });
  } catch (error) {
    const message = error?.message || 'Unable to process admin configuration.';
    const status = ['SERVER_CONFIG_MISSING', 'ADMIN_BOOTSTRAP_CONFIG_MISSING'].includes(message) ? 503 : 500;
    console.error('Admin config API error:', message);
    return reply(res, status, { error: status === 503 ? 'Server-side admin credentials are not configured.' : 'Unable to process admin configuration.' });
  }
}
