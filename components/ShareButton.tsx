'use client';

import { Share2, Facebook, Twitter, Mail, Link2, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { styles } from '@/lib/constants';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

export default function ShareButton({ url, title, description }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const shareText = description || title;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${fullUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${fullUrl}`)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        console.error('Share failed:', err);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`${styles.btn} ${styles.btnGhost} gap-2 px-4 py-2.5 text-sm`}
        aria-label="Share property"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-[rgba(201,162,39,0.18)] bg-[#121212]/95 p-3 text-[#e8e8e8] shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="space-y-2">
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/6"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span>Facebook</span>
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/6"
              >
                <Twitter className="h-5 w-5 text-sky-500" />
                <span>Twitter</span>
              </a>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/6"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span>WhatsApp</span>
              </a>
              <a
                href={shareLinks.email}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/6"
              >
                <Mail className="h-5 w-5 text-[#b0b0b0]" />
                <span>Email</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/6"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-5 w-5 text-[#b0b0b0]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
