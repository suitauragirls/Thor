import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { recordHeartbeat } from '../utils/visitorTracker';
import { captureUtmParams } from '../utils/utmTracker';

export const LiveVisitorTracker: React.FC = () => {
  const { activePage } = useShop();

  useEffect(() => {
    captureUtmParams();
    const currentPage = activePage || (typeof window !== 'undefined' ? window.location.pathname : 'home');
    recordHeartbeat(currentPage);
  }, [activePage]);

  return null;
};
