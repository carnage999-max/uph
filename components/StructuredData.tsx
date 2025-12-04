import type { Property } from '@/lib/types';
import { siteConfig } from '@/lib/metadata';

interface OrganizationSchemaProps {
  type: 'organization';
}

interface PropertySchemaProps {
  type: 'property';
  property: Property;
}

type StructuredDataProps = OrganizationSchemaProps | PropertySchemaProps;

export default function StructuredData(props: StructuredDataProps) {
  let schema: Record<string, unknown>;

  if (props.type === 'organization') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo/uph.jpeg`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Detroit',
        addressRegion: 'ME',
        postalCode: '04929',
        streetAddress: 'PO Box 52',
        addressCountry: 'US',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-207-947-1999',
        contactType: 'Customer Service',
        email: 'info@ultimatepropertyholdings.com',
      },
      sameAs: [
        // Add social media links here when available
      ],
    };
  } else {
    const { property } = props;
    const rentMin = property.rentFrom || property.units[0]?.rent;
    const rentMax = property.rentTo || property.units[property.units.length - 1]?.rent;

    schema = {
      '@context': 'https://schema.org',
      '@type': 'Apartment',
      name: property.name,
      description: property.description,
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.address,
        addressLocality: property.city,
        addressRegion: property.state,
        postalCode: property.zip,
        addressCountry: 'US',
      },
      ...(property.latitude && property.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: property.latitude,
          longitude: property.longitude,
        },
      }),
      image: property.heroImageUrl,
      ...(property.gallery.length > 0 && {
        photo: property.gallery.map(url => ({
          '@type': 'ImageObject',
          url,
        })),
      }),
      ...(rentMin && {
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: rentMin,
          ...(rentMax && rentMax !== rentMin && { priceSpecification: {
            '@type': 'UnitPriceSpecification',
            minPrice: rentMin,
            maxPrice: rentMax,
            priceCurrency: 'USD',
          }}),
        },
      }),
      ...(property.amenities.length > 0 && {
        amenityFeature: property.amenities.map(amenity => ({
          '@type': 'LocationFeatureSpecification',
          name: amenity,
        })),
      }),
      ...(property.sqftApprox && {
        floorSize: {
          '@type': 'QuantitativeValue',
          value: property.sqftApprox,
          unitText: 'square feet',
        },
      }),
      landlord: {
        '@type': 'RealEstateAgent',
        name: siteConfig.name,
        url: siteConfig.url,
      },
      url: `${siteConfig.url}/properties/${property.slug}`,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
