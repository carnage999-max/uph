'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
};

export default function Captcha({ siteKey, onVerify, onError, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onError, onExpire });
  const scriptLoadedRef = useRef(false);

  // Update callbacks ref when they change (without triggering re-render)
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire };
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Only load script once
    const loadScript = () => {
      if (scriptLoadedRef.current || document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
        scriptLoadedRef.current = true;
        // Script already loaded, just render the widget
        if (window.turnstile && containerRef.current && !widgetIdRef.current) {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => callbacksRef.current.onVerify(token),
            'error-callback': () => callbacksRef.current.onError?.(),
            'expired-callback': () => callbacksRef.current.onExpire?.(),
          });
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        scriptLoadedRef.current = true;
        if (window.turnstile && containerRef.current && !widgetIdRef.current) {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => callbacksRef.current.onVerify(token),
            'error-callback': () => callbacksRef.current.onError?.(),
            'expired-callback': () => callbacksRef.current.onExpire?.(),
          });
        }
      };

      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      // Only remove widget if component is unmounting, not on re-renders
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]); // Only depend on siteKey

  return <div ref={containerRef} className="flex justify-center" />;
}

