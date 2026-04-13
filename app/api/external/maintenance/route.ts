import '@/lib/env-loader';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidMaintenanceApiKey } from '@/lib/auth';

function addCorsHeaders(response: NextResponse, requestOrigin?: string): NextResponse {
  const corsOriginsEnv = process.env.MAINTENANCE_API_CORS_ORIGIN || process.env.UPH_MAINTENANCE_API_CORS_ORIGIN || '*';
  let corsOrigin = '*';
  
  // If env contains comma-separated origins, parse and match
  if (corsOriginsEnv !== '*' && requestOrigin) {
    const allowedOrigins = corsOriginsEnv.split(',').map(o => o.trim());
    if (allowedOrigins.includes(requestOrigin)) {
      corsOrigin = requestOrigin;
    }
  } else if (corsOriginsEnv !== '*') {
    corsOrigin = corsOriginsEnv;
  }
  
  response.headers.set('Access-Control-Allow-Origin', corsOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return addCorsHeaders(
    new NextResponse(null, { status: 204 }),
    origin || undefined
  );
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const authHeader = request.headers.get('authorization') || '';
    const apiKeyHeader = request.headers.get('x-api-key') || '';
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (authHeader || apiKeyHeader);

    try {
      if (!isValidMaintenanceApiKey(token)) {
        return addCorsHeaders(NextResponse.json({ message: 'Unauthorized' }, { status: 401 }), origin || undefined);
      }
    } catch (err: any) {
      console.error('API key config error:', err);
      return addCorsHeaders(NextResponse.json({ message: err.message || 'Server configuration error' }, { status: 500 }), origin || undefined);
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
    return addCorsHeaders(response, origin || undefined);
  } catch (error: any) {
    console.error('Error fetching maintenance requests (external):', error);
    const errorResponse = NextResponse.json(
      { message: error.message || 'Failed to fetch maintenance requests' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, origin || undefined);
  }
}
