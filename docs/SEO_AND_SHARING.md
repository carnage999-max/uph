# SEO & Social Sharing Features

This document explains the comprehensive SEO and social sharing features implemented for Ultimate Property Holdings.

## Features Implemented

### 1. Dynamic OG (Open Graph) Images

**Property-Specific OG Images** (`/api/og`)
- Generates custom 1200x630 social preview images for each property
- Includes:
  - Property hero image as background
  - Property name and location
  - Rent range with green badge
  - Key features (Pet Friendly, Bad Credit OK, Responsive Owners)
  - Brand name at the top

**Default OG Image** (`/api/og/default`)
- Used for non-property pages (home, contact, about, etc.)
- Features brand name, tagline, and three key selling points
- Professional dark gradient background

**Usage:**
- Property pages automatically use dynamic OG images
- All other pages use the default branded OG image
- Images are generated on-the-fly using Next.js ImageResponse API

### 2. Structured Data (JSON-LD)

**Organization Schema** (Root Layout)
- Defines the business entity
- Includes contact information, address, and business details
- Helps search engines understand your business

**Property Schema** (Individual Properties)
- Rich snippets for property listings
- Includes:
  - Property address and geo-coordinates
  - Pricing information (rent range)
  - Amenities
  - Images
  - Floor size
  - Landlord information

**Benefits:**
- Better search engine visibility
- Rich results in Google Search
- Improved local SEO
- Property details in search snippets

### 3. Enhanced ShareButton Component

**Features:**
- Native mobile sharing (iOS/Android share sheets)
- Desktop share menu with:
  - Facebook
  - Twitter
  - WhatsApp (NEW)
  - Email
  - Copy Link with confirmation

**Location:**
- Property detail pages (next to property title)
- Can be added to any page by importing `<ShareButton />`

**Usage:**
```tsx
<ShareButton 
  url="/properties/property-slug"
  title="Property Name"
  description="Property description"
/>
```

### 4. Comprehensive Meta Tags

**All Pages Include:**
- Page-specific title and description
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Canonical URLs
- metadataBase for proper URL resolution

**Dynamic Property Metadata:**
- Uses property name, description, and location
- Includes rent range in description
- Custom OG image for each property
- Proper URL structure

## Testing Social Previews

### Facebook
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your property URL
3. Click "Scrape Again" to refresh cache

### Twitter
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your property URL
3. Preview the card

### LinkedIn
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your property URL
3. View the preview

## File Structure

```
app/
├── layout.tsx                          # Root layout with Organization schema
├── api/
│   └── og/
│       ├── route.tsx                   # Property OG image generator
│       └── default/
│           └── route.tsx               # Default OG image generator
└── properties/
    └── [slug]/
        └── page.tsx                    # Property metadata + schema

components/
├── ShareButton.tsx                     # Social sharing component
└── StructuredData.tsx                  # JSON-LD schema component

lib/
└── metadata.ts                         # Metadata configuration & helpers
```

## Best Practices

### Adding New Pages
When creating a new page, add metadata:

```tsx
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Page Title',
  description: 'Page description for SEO',
  url: '/page-url',
});
```

### Custom OG Images
To create custom OG images for specific pages:

```tsx
const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`;

export const metadata: Metadata = createMetadata({
  title: 'Page Title',
  description: 'Description',
  image: ogImageUrl,
  url: '/page-url',
});
```

### Structured Data
To add structured data to specific pages:

```tsx
import StructuredData from '@/components/StructuredData';

export default function Page() {
  return (
    <>
      <StructuredData type="organization" />
      {/* or */}
      <StructuredData type="property" property={propertyData} />
      
      {/* Page content */}
    </>
  );
}
```

## Configuration

Update site-wide settings in `lib/metadata.ts`:

```typescript
export const siteConfig = {
  name: 'Ultimate Property Holdings',
  description: 'Your description',
  url: 'https://yourdomain.com',
  ogImage: '/api/og/default',
  // ... other settings
};
```

## Performance Notes

- OG images are generated using Edge Runtime (fast, global)
- Images are cached by social media platforms
- Structured data is minimal overhead (just JSON)
- ShareButton is client-side only where needed

## Future Enhancements

Possible additions:
- Instagram sharing
- Pinterest rich pins
- Video OG tags for video properties
- Property comparison OG images
- Localized sharing options
- Print/PDF sharing
