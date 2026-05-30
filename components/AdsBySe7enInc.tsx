const SITE_KEY = 'ultimate-property-holdings';
const LOCAL_ADS_BASE_URL = '/reader-tools';

export default function AdsBySe7enInc(){
  if (!process.env.NEXT_PUBLIC_CUSTOM_ADS_URL?.trim()) return null;

  const optionalAttributes: Record<string, string> = {};
  const maxSlots = process.env.NEXT_PUBLIC_CUSTOM_ADS_MAX_SLOTS?.trim();
  const allowedPaths = process.env.NEXT_PUBLIC_CUSTOM_ADS_ALLOWED_PATHS?.trim();
  const blockedPaths = process.env.NEXT_PUBLIC_CUSTOM_ADS_BLOCKED_PATHS?.trim();

  if (maxSlots) optionalAttributes['data-max-slots'] = maxSlots;
  if (allowedPaths) optionalAttributes['data-allowed-paths'] = allowedPaths;
  if (blockedPaths) optionalAttributes['data-blocked-paths'] = blockedPaths;

  return (
    <script
      id="ads-by-se7eninc"
      src={`${LOCAL_ADS_BASE_URL}/loader.js`}
      async
      data-base-url={LOCAL_ADS_BASE_URL}
      data-site={SITE_KEY}
      {...optionalAttributes}
    />
  );
}
