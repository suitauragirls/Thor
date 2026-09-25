import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global safety polyfills for Vivo, iQOO, Mi Browser, and restrictive WebViews
if (typeof window !== 'undefined') {
  // Safe Storage prototype wrapper so localStorage calls never throw in restricted WebViews or private mode
  try {
    const proto = Storage.prototype;
    const origSetItem = proto.setItem;
    const origGetItem = proto.getItem;
    const origRemoveItem = proto.removeItem;

    proto.setItem = function(key: string, value: string) {
      try {
        origSetItem.call(this, key, value);
      } catch (e) {
        // Silently handle storage quota or security errors in WebView
      }
    };

    proto.getItem = function(key: string) {
      try {
        return origGetItem.call(this, key);
      } catch (e) {
        return null;
      }
    };

    proto.removeItem = function(key: string) {
      try {
        origRemoveItem.call(this, key);
      } catch (e) {
        // Silently handle
      }
    };
  } catch (e) {
    // Ignore prototype override errors
  }

  // Safe matchMedia polyfill
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as any;
  }

  // Safe ResizeObserver polyfill
  if (!(window as any).ResizeObserver) {
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


