import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromMedia } from '@/lib/storage';

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string; unitId: string; imageId: string }> }){
  const { unitId, imageId } = await context.params;
  const image = await prisma.unitImage.findUnique({
    where: { id: imageId },
    select: { storageKey: true, unitId: true },
  });

  if (!image || image.unitId !== unitId){
    return NextResponse.json({ message: 'Image not found.' }, { status: 404 });
  }

  await prisma.unitImage.delete({ where: { id: imageId } });

  if (image.storageKey){
    try {
      await deleteFileFromMedia(image.storageKey);
    } catch {
      // ignore
    }
  }

  return new NextResponse(null, { status: 204 });
}
