import { notFound } from 'next/navigation';
import { styles } from '@/lib/constants';
import { getPropertyById } from '@/lib/properties';
import PropertyBasicsForm from './parts/PropertyBasicsForm';
import HeroImageUploader from './parts/HeroImageUploader';
import GalleryManager from './parts/GalleryManager';
import UnitsManager from './parts/UnitsManager';

type Params = { id: string } | Promise<{ id: string }>;

export default async function AdminEditPropertyPage({ params }: { params: Params }){
  const { id } = await Promise.resolve(params);
  const property = await getPropertyById(id);
  if (!property) return notFound();

  return (
    <div className={`${styles.container} space-y-8`}>
      <header className="space-y-1">
        <h1 className="font-montserrat text-2xl font-semibold text-gray-900">
          Edit: {property.name}
        </h1>
        <p className="text-sm text-gray-600">
          Update listing content, manage imagery, and control availability.
        </p>
      </header>

      <HeroImageUploader propertyId={property.id} heroImageUrl={property.heroImageUrl} />

      <GalleryManager propertyId={property.id} images={property.galleryDetails ?? []} />

      <PropertyBasicsForm property={property} />

      {property.hasUnits && (
        <UnitsManager propertyId={property.id} propertySlug={property.slug} units={property.units} />
      )}
    </div>
  );
}
