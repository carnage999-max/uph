'use client';
import { useEffect, useState, useCallback } from 'react';
import { styles } from '@/lib/constants';
import Captcha from '@/app/apply/parts/Captcha';
import LuxuryCTA from '@/components/LuxuryCTA';

export default function ContactForm(){
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [property, setProperty] = useState<string | null>(null);
  const [unit, setUnit] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Memoize callbacks to prevent CAPTCHA re-initialization
  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  const handleCaptchaError = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const p = params.get('property'); const u = params.get('unit');
    if(p) setProperty(p); if(u) setUnit(u);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setOk(null); setErr(null);

    if (!captchaToken) {
      setErr('Please complete the CAPTCHA verification.');
      return;
    }

    const target = e.currentTarget;
    const fd = new FormData(target);
    fd.append('captchaToken', captchaToken);
    
    setLoading(true);
    try{
      const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(Object.fromEntries(fd)) });
      const j = await res.json();
      if(!res.ok) throw new Error(j.error || 'Failed');
      setOk('Thanks! Your message has been sent.');
      target.reset();
      setCaptchaToken(null);
    }catch(e:any){ setErr(e.message); }
    finally{ setLoading(false); }
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      {property && <input type="hidden" name="aboutProperty" value={property} />}
      {unit && <input type="hidden" name="aboutUnit" value={unit} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={styles.inputBase} name="name" placeholder="Full Name" required />
        <input className={styles.inputBase} name="email" placeholder="Email" type="email" required />
      </div>
      <input className={styles.inputBase} name="phone" placeholder="Phone (optional)" />
      <textarea className={styles.textarea} name="message" placeholder="How can we help?" rows={5} required />
      <div className="border-t border-white/10 pt-4">
        <p className="mb-4 text-sm text-[#b0b0b0]">Security Verification</p>
        <Captcha
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onVerify={handleCaptchaVerify}
          onError={handleCaptchaError}
          onExpire={handleCaptchaExpire}
        />
        {!captchaToken && (
          <p className="mt-2 text-xs text-[#8f8f8f]">CAPTCHA verification required to submit.</p>
        )}
      </div>
      <LuxuryCTA
        label={loading ? 'Sending…' : 'Send Message'}
        type="submit"
        showOrnaments={false}
        disabled={loading || !captchaToken}
        className="w-full! max-w-none"
      />
      {ok && <div className="text-sm text-emerald-400">{ok}</div>}
      {err && <div className="text-sm text-red-400">{err}</div>}
    </form>
  );
}
