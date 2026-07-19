import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToMedia, deleteFileFromMedia } from '@/lib/storage';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string; unitId: string }> }){
  const { id, unitId } = await context.params;
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0){
    return NextResponse.json({ message: 'Cover image file is required.' }, { status: 400 });
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: {
      property: { select: { slug: true } },
      coverImageKey: true,
    },
  });

  if (!unit){
    return NextResponse.json({ message: 'Unit not found.' }, { status: 404 });
  }

  const upload = await uploadFileToMedia(file, `properties/${unit.property.slug || id}/units/${unitId}/cover`);

  const updated = await prisma.unit.update({
    where: { id: unitId },
    data: {
      coverImage: upload.url,
      coverImageKey: upload.key,
    },
    select: { coverImage: true, coverImageKey: true },
  });

  if (unit.coverImageKey){
    try {
      await deleteFileFromMedia(unit.coverImageKey);
    } catch {
      // ignore clean-up errors
    }
  }

  return NextResponse.json({ coverImage: updated.coverImage, coverImageKey: updated.coverImageKey });
}
