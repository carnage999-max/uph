import { notFound } from 'next/navigation';
import { getPropertyBySlug } from '@/lib/properties';
import PropertyDetailClient from './PropertyDetailClient';
import StructuredData from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  
  if (!property) {
    return createMetadata({
      title: 'Property Not Found',
      noIndex: true,
    });
  }

  const rentRange = property.rentFrom && property.rentTo 
    ? `$${property.rentFrom}-$${property.rentTo}/mo`
    : property.rentFrom 
    ? `From $${property.rentFrom}/mo`
    : '';

  const description = `${property.name} in ${property.city}, Maine. ${property.description.slice(0, 150)}... ${rentRange}`;

  // Generate dynamic OG image URL with property details
  const ogImageUrl = `/api/og?title=${encodeURIComponent(property.name)}&location=${encodeURIComponent(`${property.city}, Maine`)}&rent=${encodeURIComponent(rentRange)}&image=${encodeURIComponent(property.heroImageUrl)}`;

  return createMetadata({
    title: property.name,
    description,
    image: ogImageUrl,
    url: `/properties/${property.slug}`,
  });
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }){
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return notFound();
  return (
    <>
      <StructuredData type="property" property={property} />
      <PropertyDetailClient property={property} />
    </>
  );
}
