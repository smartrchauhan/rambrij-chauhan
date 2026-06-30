"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface Props {
  onSuccess: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, Props>(
  ({ onSuccess, onExpire, onError }, ref) => {
    const instanceRef = useRef<TurnstileInstance | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => instanceRef.current?.reset(),
    }));

    if (!SITE_KEY) {
      return (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          CAPTCHA not configured — set <code className="font-mono">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> to enable.
        </p>
      );
    }

    return (
      <Turnstile
        ref={instanceRef}
        siteKey={SITE_KEY}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{ theme: "light", size: "normal" }}
      />
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";
export default TurnstileWidget;
export { SITE_KEY };
