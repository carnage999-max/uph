'use client';
import { useEffect, useState, useCallback } from 'react';
import { styles } from '@/lib/constants';
import Captcha from '@/app/apply/parts/Captcha';

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
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-600 mb-4">Security Verification</p>
        <Captcha
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
          onVerify={handleCaptchaVerify}
          onError={handleCaptchaError}
          onExpire={handleCaptchaExpire}
        />
        {!captchaToken && (
          <p className="text-xs text-gray-500 mt-2">CAPTCHA verification required to submit</p>
        )}
      </div>
      <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading || !captchaToken}>{loading ? 'Sending…' : 'Send Message'}</button>
      {ok && <div className="text-sm text-green-600">{ok}</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
    </form>
  );
}
