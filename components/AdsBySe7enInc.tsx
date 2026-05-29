import Script from 'next/script';

function getAdsServiceUrl(){
  const rawUrl = process.env.NEXT_PUBLIC_ADS_SERVICE_URL?.trim();
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    return url.origin + url.pathname.replace(/\/$/, '');
  } catch {
    return null;
  }
}

export default function AdsBySe7enInc(){
  const serviceUrl = getAdsServiceUrl();
  const site = process.env.NEXT_PUBLIC_ADS_SITE?.trim() || 'ultimate-property-holdings';

  if (!serviceUrl || !site) return null;

  const optionalAttributes: Record<string, string> = {};
  const maxSlots = process.env.NEXT_PUBLIC_ADS_MAX_SLOTS?.trim();
  const allowedPaths = process.env.NEXT_PUBLIC_ADS_ALLOWED_PATHS?.trim();
  const blockedPaths = process.env.NEXT_PUBLIC_ADS_BLOCKED_PATHS?.trim();

  if (maxSlots) optionalAttributes['data-max-slots'] = maxSlots;
  if (allowedPaths) optionalAttributes['data-allowed-paths'] = allowedPaths;
  if (blockedPaths) optionalAttributes['data-blocked-paths'] = blockedPaths;

  return (
    <Script
      id="ads-by-se7eninc"
      src={`${serviceUrl}/widget.js`}
      strategy="afterInteractive"
      data-site={site}
      {...optionalAttributes}
    />
  );
}
