import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { supabase } from '../lib/supabase';
import { isLocalPreviewEnvironment, recordHeartbeat } from '../utils/visitorTracker';
import { captureUtmParams, getStoredUtmParams } from '../utils/utmTracker';

const getSessionId = (): string => {
  try {
    let sid = sessionStorage.getItem('sag_live_session_id');
    if (!sid) {
      sid = 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('sag_live_session_id', sid);
    }
    return sid;
  } catch {
    return 'vis_temp_' + Date.now();
  }
};

const getDeviceType = (): string => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/Instagram|FBAV|FBAN|FB_IAB/i.test(ua)) return 'instagram_webview';
  if (/mobile/i.test(ua)) return 'mobile';
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  return 'desktop';
};

export const LiveVisitorTracker: React.FC = () => {
  const { activePage } = useShop();

  useEffect(() => {
    // Capture UTM & fbclid from URL query params on app mount & route change
    captureUtmParams();

    const currentPage = activePage || (typeof window !== 'undefined' ? window.location.pathname : 'home');

    // Record visitor session once on page transition (debounced to 1 write per day in visitorTracker)
    recordHeartbeat(currentPage);

    if (isLocalPreviewEnvironment()) return;

    const pingLiveVisitor = async () => {
      try {
        const sessionId = getSessionId();
        const deviceType = getDeviceType();
        const utmParams = getStoredUtmParams();

        const payload = {
          id: sessionId,
          session_id: sessionId,
          page: currentPage,
          device_type: deviceType,
          utm_source: utmParams.utm_source || (utmParams.fbclid ? 'meta_ads' : 'direct'),
          utm_medium: utmParams.utm_medium || '',
          utm_campaign: utmParams.utm_campaign || '',
          fbclid: utmParams.fbclid || '',
          is_instagram_webview: utmParams.is_instagram_webview || false,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          last_ping: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Ping Supabase live_visitors table (generous limits, no daily quota)
        const { error } = await supabase
          .from('live_visitors')
          .upsert([payload], { onConflict: 'session_id' });

        if (error) {
          // Retry with onConflict id if session_id is not PK
          await supabase
            .from('live_visitors')
            .upsert([payload], { onConflict: 'id' });
        }
      } catch (err) {
        console.warn('Live visitor ping notice:', err);
      }
    };

    // Ping Supabase on mount & activePage change
    pingLiveVisitor();

    // Gentle live ping every 45 seconds to Supabase
    const intervalId = setInterval(pingLiveVisitor, 45000);

    return () => clearInterval(intervalId);
  }, [activePage]);

  return null;
};
