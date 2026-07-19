import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToMedia } from '@/lib/storage';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }){
  const { id } = await context.params;
  const formData = await request.formData();
  const files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0);

  if (!files.length){
    return NextResponse.json({ message: 'No files to upload.' }, { status: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id },
    select: { slug: true, images: { select: { order: true } } },
  });

  if (!property){
    return NextResponse.json({ message: 'Property not found.' }, { status: 404 });
  }

  const nextOrder = property.images.length
    ? Math.max(...property.images.map((image)=> image.order)) + 1
    : 0;

  const uploads = [];
  for (const file of files){
    const upload = await uploadFileToMedia(file, `properties/${property.slug || id}/gallery`);
    uploads.push(upload);
  }

  const images = await prisma.$transaction(
    uploads.map((upload, index)=> prisma.propertyImage.create({
      data: {
        propertyId: id,
        url: upload.url,
        storageKey: upload.key,
        order: nextOrder + index,
      },
    })),
  );

  return NextResponse.json({ images });
}
