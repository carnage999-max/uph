import { prisma } from './prisma';
import type { Property, Unit } from './types';

function slugify(value: string){
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type PropertySummary = Awaited<ReturnType<typeof listProperties>>[number];
export type PropertyWithRelations = Awaited<ReturnType<typeof getPropertyBySlug>>;

function mapProperty(property: any): Property{
  const sortedImages = (property.images ?? []).sort((a: any, b: any)=> a.order - b.order);
  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    zip: property.zip,
    status: property.status ?? '',
    type: property.type,
    description: property.description,
    bedroomsSummary: property.bedroomsSummary ?? '',
    bathsSummary: property.bathsSummary ?? '',
    sqftApprox: property.sqftApprox ?? '',
    heroImageUrl: property.heroImageUrl,
    heroImageKey: property.heroImageKey ?? null,
    gallery: sortedImages.map((image: any)=> image.url),
    galleryKeys: sortedImages.map((image: any)=> image.storageKey ?? null),
    galleryDetails: sortedImages.map((image: any)=> ({
      id: image.id,
      url: image.url,
      storageKey: image.storageKey ?? null,
      order: image.order,
    })),
    amenities: property.amenities ?? [],
    rentFrom: property.rentFrom ?? null,
    rentTo: property.rentTo ?? null,
    hasUnits: property.hasUnits,
    latitude: property.latitude,
    longitude: property.longitude,
    units: (property.units ?? []).map(mapUnit),
    createdAt: property.createdAt?.toISOString?.() ?? undefined,
    updatedAt: property.updatedAt?.toISOString?.() ?? undefined,
  };
}

function mapUnit(unit: any): Unit{
  const sortedImages = (unit.images ?? []).sort((a: any, b: any)=> a.order - b.order);
  return {
    id: unit.id,
    label: unit.label,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    sqft: unit.sqft,
    rent: unit.rent,
    available: unit.available,
    isHidden: unit.isHidden,
    coverImageUrl: unit.coverImage ?? null,
    coverImageKey: unit.coverImageKey ?? null,
    gallery: sortedImages.map((image: any)=> image.url),
    galleryKeys: sortedImages.map((image: any)=> image.storageKey ?? null),
    galleryDetails: sortedImages.map((image: any)=> ({
      id: image.id,
      url: image.url,
      storageKey: image.storageKey ?? null,
      order: image.order,
    })),
    createdAt: unit.createdAt?.toISOString?.() ?? undefined,
    updatedAt: unit.updatedAt?.toISOString?.() ?? undefined,
  };
}

export async function listProperties(){
  try {
    const properties = await prisma.property.findMany({
      include: {
        images: true,
        units: {
          include: { images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map(mapProperty);
  } catch (err) {
    // Defensive: if the DB isn't reachable (missing env, network issue, etc.)
    // log the error and return an empty list so the site doesn't crash.
    // The real fix is to ensure DATABASE_URL / DATABASE_URL_UNPOOLED are set
    // in the Amplify environment or via Secrets/SSM.
    // eslint-disable-next-line no-console
    console.error('listProperties error:', err);
    return [] as Property[];
  }
}

export async function getPropertyBySlug(slug: string){
  try {
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        images: true,
        units: {
          include: { images: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return property ? mapProperty(property) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getPropertyBySlug error:', err);
    return null;
  }
}

export async function getPropertyById(id: string){
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        units: {
          include: { images: true },
        },
      },
    });
    return property ? mapProperty(property) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getPropertyById error:', err);
    return null;
  }
}

export async function generateUniquePropertySlug(name: string){
  const base = slugify(name || 'property');
  let slug = base;
  let attempt = 1;
  try {
    while (await prisma.property.findUnique({ where: { slug } })){
      slug = `${base}-${attempt++}`;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('generateUniquePropertySlug error:', err);
    // In case of DB errors just return the base or with attempt appended
    return slug;
  }
  return slug;
}
