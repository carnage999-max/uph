import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromMedia } from '@/lib/storage';

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string; imageId: string }> }){
  const { id, imageId } = await context.params;
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
    select: { storageKey: true, propertyId: true },
  });

  if (!image || image.propertyId !== id){
    return NextResponse.json({ message: 'Image not found.' }, { status: 404 });
  }

  await prisma.propertyImage.delete({ where: { id: imageId } });

  if (image.storageKey){
    try {
      await deleteFileFromMedia(image.storageKey);
    } catch {
      // ignore clean-up errors
    }
  }

  return new NextResponse(null, { status: 204 });
}
