import { Metadata } from 'next';

const fallbackSiteOrigin = 'https://atlasproperties.net';

export const siteConfig = {
  name: 'Atlas Properties',
  description:
    'Premium residential apartments across Maine. Pet-friendly, responsive management, and flexible credit options.',
  url: process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.APP_ORIGIN || fallbackSiteOrigin,
  ogImage: '/logo/atlas.png',
  links: {
    contact: '/contact',
    properties: '/properties',
    maintenance: '/maintenance',
  }
};

export function createMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const metaUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;

  return {
    title: metaTitle,
    description: metaDescription,
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: metaUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
    alternates: {
      canonical: metaUrl,
    },
  };
}
