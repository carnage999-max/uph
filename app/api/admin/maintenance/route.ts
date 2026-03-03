import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [requests, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching maintenance requests:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch maintenance requests' },
      { status: 500 }
    );
  }
}
