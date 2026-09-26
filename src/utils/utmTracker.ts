export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
  ref?: string;
  is_instagram_webview?: boolean;
  captured_at?: string;
}

const STORAGE_KEY_SESSION = 'sag_utm_params_v1';
const STORAGE_KEY_LOCAL = 'sag_utm_params_backup_v1';

export const isInstagramWebview = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Instagram|FBAV|FBAN|FB_IAB|FB4A/i.test(ua);
};

export const captureUtmParams = (): UtmParams => {
  let params: UtmParams = {};

  try {
    // Attempt load from existing storage first
    const sessionRaw = sessionStorage.getItem(STORAGE_KEY_SESSION);
    const localRaw = localStorage.getItem(STORAGE_KEY_LOCAL);

    if (sessionRaw) {
      params = JSON.parse(sessionRaw);
    } else if (localRaw) {
      params = JSON.parse(localRaw);
    }
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      const utm_source = urlParams.get('utm_source');
      const utm_medium = urlParams.get('utm_medium');
      const utm_campaign = urlParams.get('utm_campaign');
      const utm_term = urlParams.get('utm_term');
      const utm_content = urlParams.get('utm_content');
      const fbclid = urlParams.get('fbclid');
      const gclid = urlParams.get('gclid');
      const ref = urlParams.get('ref');

      // If URL contains any new tracking params, update
      if (utm_source || utm_medium || utm_campaign || utm_term || utm_content || fbclid || gclid || ref) {
        if (utm_source) params.utm_source = utm_source;
        if (utm_medium) params.utm_medium = utm_medium;
        if (utm_campaign) params.utm_campaign = utm_campaign;
        if (utm_term) params.utm_term = utm_term;
        if (utm_content) params.utm_content = utm_content;
        if (fbclid) params.fbclid = fbclid;
        if (gclid) params.gclid = gclid;
        if (ref) params.ref = ref;

        params.captured_at = new Date().toISOString();
      }

      params.is_instagram_webview = isInstagramWebview();

      // Persist to SessionStorage & LocalStorage for Webview durability
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(params));
      localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(params));
    } catch (err) {
      console.warn('UTM Parameter capture notice:', err);
    }
  }

  return params;
};

export const getStoredUtmParams = (): UtmParams => {
  return captureUtmParams();
};
