import '@/lib/env-loader';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToMedia } from '@/lib/storage';
import { sendMaintenanceStatusUpdateEmail } from '@/lib/email-notifications';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
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

  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type');

    let status: string;
    let comment: string | undefined;
    let commentAttachmentUrl: string | null = null;
    let commentAttachmentKey: string | null = null;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      status = String(formData.get('status') || '').trim();
      comment = String(formData.get('comment') || '').trim() || undefined;
      const media = formData.get('media');

      if (media instanceof File && media.size > 0) {
        try {
          const upload = await uploadFileToMedia(media, `maintenance-updates/${Date.now()}`);
          commentAttachmentUrl = upload.url;
          commentAttachmentKey = upload.key;
        } catch (error: any) {
          return addCorsHeaders(NextResponse.json({ message: error.message || 'Unable to upload attachment.' }, { status: 500 }), origin || undefined);
        }
      }
    } else {
      const body = await request.json();
      status = body.status;
      comment = body.comment;
    }

    if (!status) {
      return addCorsHeaders(NextResponse.json({ message: 'Status is required' }, { status: 400 }), origin || undefined);
    }

    const currentRequest = await prisma.maintenanceRequest.findUnique({ where: { id } });

    if (!currentRequest) {
      return addCorsHeaders(NextResponse.json({ message: 'Maintenance request not found' }, { status: 404 }), origin || undefined);
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        statusUpdatedAt: new Date(),
        adminComment: comment,
        commentAttachmentUrl,
        commentAttachmentKey,
      },
    });

    if (currentRequest.email && ['in-progress', 'completed', 'closed'].includes(status)) {
      try {
        await sendMaintenanceStatusUpdateEmail({
          email: currentRequest.email,
          name: currentRequest.name,
          address: currentRequest.address,
          issueType: currentRequest.issueType,
          ticketId: currentRequest.id,
          status,
          comment,
          commentAttachmentUrl: commentAttachmentUrl || undefined,
        });
      } catch (emailError) {
        console.error('Error sending status update email (external):', emailError);
      }
    }

    return addCorsHeaders(NextResponse.json(updated), origin || undefined);
  } catch (error: any) {
    console.error('Error updating maintenance request (external):', error);
    const errorResponse = NextResponse.json(
      { message: error.message || 'Failed to update maintenance request' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, origin || undefined);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
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

  try {
    const { id } = await params;

    const maintenance = await prisma.maintenanceRequest.findUnique({ where: { id } });

    if (!maintenance) {
      return addCorsHeaders(NextResponse.json({ message: 'Not found' }, { status: 404 }), origin || undefined);
    }

    return addCorsHeaders(NextResponse.json(maintenance), origin || undefined);
  } catch (error: any) {
    console.error('Error fetching maintenance request (external):', error);
    const errorResponse = NextResponse.json(
      { message: error.message || 'Failed to fetch maintenance request' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, origin || undefined);
  }
}
