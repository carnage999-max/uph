import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromMedia } from '@/lib/storage';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; unitId: string }> }){
  const { unitId } = await context.params;
  const body = await request.json().catch(()=> null);
  if (!body){
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if ('label' in body) data.label = String(body.label || '').trim();

  for (const field of ['bedrooms', 'bathrooms', 'sqft'] as const){
    if (field in body){
      const value = Number(body[field]);
      if (Number.isNaN(value)){
        return NextResponse.json({ message: `${field} must be numeric.` }, { status: 400 });
      }
      data[field] = value;
    }
  }

  if ('rent' in body){
    if (body.rent === null || body.rent === ''){
      data.rent = null;
    } else {
      const rent = Number(body.rent);
      if (Number.isNaN(rent)){
        return NextResponse.json({ message: 'rent must be numeric.' }, { status: 400 });
      }
      data.rent = rent;
    }
  }

  if ('available' in body) data.available = Boolean(body.available);
  if ('isHidden' in body) data.isHidden = Boolean(body.isHidden);

  const unit = await prisma.unit.update({
    where: { id: unitId },
    data,
    include: { images: true },
  }).catch(()=> null);

  if (!unit){
    return NextResponse.json({ message: 'Unit not found.' }, { status: 404 });
  }

  return NextResponse.json({ unit });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string; unitId: string }> }){
  const { unitId } = await context.params;
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { images: true },
  });

  if (!unit){
    return NextResponse.json({ message: 'Unit not found.' }, { status: 404 });
  }

  await prisma.unit.delete({ where: { id: unitId } });

  const keys: string[] = [];
  if (unit.coverImageKey) keys.push(unit.coverImageKey);
  for (const image of unit.images){
    if (image.storageKey) keys.push(image.storageKey);
  }

  for (const key of keys){
    try {
      await deleteFileFromMedia(key);
    } catch {
      // ignore clean up errors
    }
  }

  return new NextResponse(null, { status: 204 });
}
