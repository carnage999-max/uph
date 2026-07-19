import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToMedia, deleteFileFromMedia } from '@/lib/storage';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }){
  const { id } = await context.params;
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0){
    return NextResponse.json({ message: 'Property image file is required.' }, { status: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id },
    select: { slug: true, heroImageKey: true },
  });

  if (!property){
    return NextResponse.json({ message: 'Property not found.' }, { status: 404 });
  }

  const upload = await uploadFileToMedia(file, `properties/${property.slug || id}/hero`);

  const updated = await prisma.property.update({
    where: { id },
    data: {
      heroImageUrl: upload.url,
      heroImageKey: upload.key,
    },
    select: { heroImageUrl: true, heroImageKey: true },
  });

  if (property.heroImageKey){
    try {
      await deleteFileFromMedia(property.heroImageKey);
    } catch {
      // ignore clean-up errors
    }
  }

  return NextResponse.json({ heroImageUrl: updated.heroImageUrl, heroImageKey: updated.heroImageKey });
}
