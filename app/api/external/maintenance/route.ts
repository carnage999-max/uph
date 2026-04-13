import '@/lib/env-loader';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidMaintenanceApiKey } from '@/lib/auth';

function addCorsHeaders(response: NextResponse): NextResponse {
  const corsOrigin = process.env.MAINTENANCE_API_CORS_ORIGIN || process.env.UPH_MAINTENANCE_API_CORS_ORIGIN || '*';
  response.headers.set('Access-Control-Allow-Origin', corsOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(
    new NextResponse(null, { status: 204 })
  );
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const apiKeyHeader = request.headers.get('x-api-key') || '';
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (authHeader || apiKeyHeader);

    try {
      if (!isValidMaintenanceApiKey(token)) {
        return addCorsHeaders(NextResponse.json({ message: 'Unauthorized' }, { status: 401 }));
      }
    } catch (err: any) {
      console.error('API key config error:', err);
      return addCorsHeaders(NextResponse.json({ message: err.message || 'Server configuration error' }, { status: 500 }));
    }

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

    const response = NextResponse.json({
      requests,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
    return addCorsHeaders(response);
  } catch (error: any) {
    console.error('Error fetching maintenance requests (external):', error);
    const errorResponse = NextResponse.json(
      { message: error.message || 'Failed to fetch maintenance requests' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
