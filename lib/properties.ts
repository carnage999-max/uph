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
    underConstruction: property.underConstruction ?? false,
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
    console.log('[listProperties] Starting...');
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        status: true,
        type: true,
        description: true,
        bedroomsSummary: true,
        bathsSummary: true,
        sqftApprox: true,
        heroImageUrl: true,
        heroImageKey: true,
        rentFrom: true,
        rentTo: true,
        latitude: true,
        longitude: true,
        amenities: true,
        hasUnits: true,
        underConstruction: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            url: true,
            storageKey: true,
            order: true,
          },
        },
        units: {
          select: {
            id: true,
            label: true,
            bedrooms: true,
            bathrooms: true,
            sqft: true,
            rent: true,
            available: true,
            isHidden: true,
            coverImage: true,
            coverImageKey: true,
            createdAt: true,
            updatedAt: true,
            images: {
              select: {
                id: true,
                url: true,
                storageKey: true,
                order: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[listProperties] Found', properties.length, 'properties');
    return properties.map(mapProperty);
  } catch (err) {
    // Defensive: if the DB isn't reachable (missing env, network issue, etc.)
    // log the error and return an empty list so the site doesn't crash.
    // The real fix is to ensure DATABASE_URL / DATABASE_URL_UNPOOLED are set
    // in the Amplify environment or via Secrets/SSM.
    console.error('[listProperties] Error:', JSON.stringify(err, null, 2));
    console.error('[listProperties] Stack:', err instanceof Error ? err.stack : 'N/A');
    return [] as Property[];
  }
}

export async function getPropertyBySlug(slug: string){
  try {
    const property = await prisma.property.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        status: true,
        type: true,
        description: true,
        bedroomsSummary: true,
        bathsSummary: true,
        sqftApprox: true,
        heroImageUrl: true,
        heroImageKey: true,
        rentFrom: true,
        rentTo: true,
        latitude: true,
        longitude: true,
        amenities: true,
        hasUnits: true,
        underConstruction: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            url: true,
            storageKey: true,
            order: true,
          },
        },
        units: {
          select: {
            id: true,
            label: true,
            bedrooms: true,
            bathrooms: true,
            sqft: true,
            rent: true,
            available: true,
            isHidden: true,
            coverImage: true,
            coverImageKey: true,
            createdAt: true,
            updatedAt: true,
            images: {
              select: {
                id: true,
                url: true,
                storageKey: true,
                order: true,
              },
            },
          },
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
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        status: true,
        type: true,
        description: true,
        bedroomsSummary: true,
        bathsSummary: true,
        sqftApprox: true,
        heroImageUrl: true,
        heroImageKey: true,
        rentFrom: true,
        rentTo: true,
        latitude: true,
        longitude: true,
        amenities: true,
        hasUnits: true,
        underConstruction: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            url: true,
            storageKey: true,
            order: true,
          },
        },
        units: {
          select: {
            id: true,
            label: true,
            bedrooms: true,
            bathrooms: true,
            sqft: true,
            rent: true,
            available: true,
            isHidden: true,
            coverImage: true,
            coverImageKey: true,
            createdAt: true,
            updatedAt: true,
            images: {
              select: {
                id: true,
                url: true,
                storageKey: true,
                order: true,
              },
            },
          },
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
