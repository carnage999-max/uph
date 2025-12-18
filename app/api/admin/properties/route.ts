import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listProperties, generateUniquePropertySlug } from '@/lib/properties';
import { uploadFileToS3 } from '@/lib/storage';
import { requireAdminAuth } from '@/lib/auth/api-middleware';

export async function GET(request: NextRequest){
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  const properties = await listProperties();
  return NextResponse.json({ properties });
}

export async function POST(request: NextRequest){
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  const formData = await request.formData();
  const rawPayload = formData.get('payload');

  if (typeof rawPayload !== 'string'){
    return NextResponse.json({ message: 'Missing payload.' }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ message: 'Invalid payload JSON.' }, { status: 400 });
  }

  const requiredFields = ['name', 'address', 'city', 'state', 'zip', 'type', 'description', 'heroImageField'];
  const missing = requiredFields.filter((field)=> !payload[field]);
  if (missing.length){
    return NextResponse.json({ message: `Missing fields: ${missing.join(', ')}` }, { status: 400 });
  }

  const heroFieldName = payload.heroImageField as string;
  const heroFile = formData.get(heroFieldName);
  if (!(heroFile instanceof File) || heroFile.size === 0){
    return NextResponse.json({ message: 'Property image is required.' }, { status: 400 });
  }

  const slug = await generateUniquePropertySlug(payload.name);

  try {
    const heroUpload = await uploadFileToS3(heroFile, `properties/${slug}/hero`);

    const galleryUploads: Array<{ url: string; key: string }> = [];
    for (const fieldName of payload.galleryFields ?? []){
      const galleryFile = formData.get(fieldName);
      if (galleryFile instanceof File && galleryFile.size > 0){
        const upload = await uploadFileToS3(galleryFile, `properties/${slug}/gallery`);
        galleryUploads.push(upload);
      }
    }

    const unitsInput: any[] = Array.isArray(payload.units) ? payload.units : [];
    const unitUploads: Array<{
      cover?: { url: string; key: string };
      gallery: Array<{ url: string; key: string }>;
    }> = [];

    for (let index = 0; index < unitsInput.length; index++){
      const unitPayload = unitsInput[index];
      const unitPrefix = `properties/${slug}/units/${index + 1}`;
      const uploads: { cover?: { url: string; key: string }; gallery: Array<{ url: string; key: string }>; } = {
        gallery: [],
      };
      if (unitPayload.coverImageField){
        const coverFile = formData.get(unitPayload.coverImageField);
        if (coverFile instanceof File && coverFile.size > 0){
          uploads.cover = await uploadFileToS3(coverFile, `${unitPrefix}/cover`);
        }
      }
      for (const galleryField of unitPayload.galleryFields ?? []){
        const unitGalleryFile = formData.get(galleryField);
        if (unitGalleryFile instanceof File && unitGalleryFile.size > 0){
          const upload = await uploadFileToS3(unitGalleryFile, `${unitPrefix}/gallery`);
          uploads.gallery.push(upload);
        }
      }
      unitUploads.push(uploads);
    }

    const rentFrom = payload.rentFrom !== undefined && payload.rentFrom !== null && payload.rentFrom !== ''
      ? Number(payload.rentFrom) : null;
    const rentTo = payload.rentTo !== undefined && payload.rentTo !== null && payload.rentTo !== ''
      ? Number(payload.rentTo) : null;

    const latitude = payload.latitude !== undefined && payload.latitude !== null && payload.latitude !== ''
      ? Number(payload.latitude) : null;
    const longitude = payload.longitude !== undefined && payload.longitude !== null && payload.longitude !== ''
      ? Number(payload.longitude) : null;

    const property = await prisma.property.create({
      data: {
        name: payload.name,
        slug,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        zip: payload.zip,
        status: payload.status ?? null,
        type: payload.type,
        description: payload.description,
        bedroomsSummary: payload.bedroomsSummary ?? null,
        bathsSummary: payload.bathsSummary ?? null,
        sqftApprox: payload.sqftApprox ?? null,
        heroImageUrl: heroUpload.url,
        heroImageKey: heroUpload.key,
        rentFrom,
        rentTo,
        amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
        hasUnits: Boolean(payload.hasUnits),
        underConstruction: Boolean(payload.underConstruction),
        latitude,
        longitude,
        images: {
          create: galleryUploads.map((upload, index)=> ({
            url: upload.url,
            storageKey: upload.key,
            order: index,
          })),
        },
        units: {
          create: unitsInput.map((unitPayload, index)=> {
            const uploads = unitUploads[index];
            const rent = unitPayload.rent !== undefined && unitPayload.rent !== null && unitPayload.rent !== ''
              ? Number(unitPayload.rent)
              : null;
            if (rent !== null && Number.isNaN(rent)){
              throw new Error('Unit rent must be numeric.');
            }
            const bedrooms = Number(unitPayload.bedrooms);
            const bathrooms = Number(unitPayload.bathrooms);
            const sqft = Number(unitPayload.sqft);
            if ([bedrooms, bathrooms, sqft].some((value)=> Number.isNaN(value))){
              throw new Error('Unit bedrooms, bathrooms, and square footage must be numeric.');
            }
            return {
              label: unitPayload.label,
              bedrooms,
              bathrooms,
              sqft,
              rent,
              available: Boolean(unitPayload.available),
              isHidden: Boolean(unitPayload.isHidden),
              coverImage: uploads?.cover?.url ?? null,
              coverImageKey: uploads?.cover?.key ?? null,
              images: {
                create: uploads?.gallery.map((upload, galleryIndex)=> ({
                  url: upload.url,
                  storageKey: upload.key,
                  order: galleryIndex,
                })) ?? [],
              },
            };
          }),
        },
      },
      include: {
        images: true,
        units: {
          include: { images: true },
        },
      },
    });

    return NextResponse.json({ property });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to create property.' }, { status: 500 });
  }
}
