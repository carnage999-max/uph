import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToMedia } from '@/lib/storage';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string; unitId: string }> }){
  const { id, unitId } = await context.params;
  const formData = await request.formData();
  const files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0);

  if (!files.length){
    return NextResponse.json({ message: 'No files to upload.' }, { status: 400 });
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: {
      property: { select: { slug: true } },
      images: { select: { order: true } },
    },
  });

  if (!unit){
    return NextResponse.json({ message: 'Unit not found.' }, { status: 404 });
  }

  const nextOrder = unit.images.length
    ? Math.max(...unit.images.map((image)=> image.order)) + 1
    : 0;

  const uploads = [];
  for (const file of files){
    const upload = await uploadFileToMedia(file, `properties/${unit.property.slug || id}/units/${unitId}/gallery`);
    uploads.push(upload);
  }

  const images = await prisma.$transaction(
    uploads.map((upload, index)=> prisma.unitImage.create({
      data: {
        unitId,
        url: upload.url,
        storageKey: upload.key,
        order: nextOrder + index,
      },
    })),
  );

  return NextResponse.json({ images });
}
