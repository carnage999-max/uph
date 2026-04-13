import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/storage';
import { sendMaintenanceStatusUpdateEmail } from '@/lib/email-notifications';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          const upload = await uploadFileToS3(media, `maintenance-updates/${Date.now()}`);
          commentAttachmentUrl = upload.url;
          commentAttachmentKey = upload.key;
        } catch (error: any) {
          return addCorsHeaders(NextResponse.json({ message: error.message || 'Unable to upload attachment.' }, { status: 500 }));
        }
      }
    } else {
      const body = await request.json();
      status = body.status;
      comment = body.comment;
    }

    if (!status) {
      return addCorsHeaders(NextResponse.json({ message: 'Status is required' }, { status: 400 }));
    }

    const currentRequest = await prisma.maintenanceRequest.findUnique({ where: { id } });

    if (!currentRequest) {
      return addCorsHeaders(NextResponse.json({ message: 'Maintenance request not found' }, { status: 404 }));
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

    return addCorsHeaders(NextResponse.json(updated));
  } catch (error: any) {
    console.error('Error updating maintenance request (external):', error);
    const errorResponse = NextResponse.json(
      { message: error.message || 'Failed to update maintenance request' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  try {
    const { id } = await params;

    const maintenance = await prisma.maintenanceRequest.findUnique({ where: { id } });

    if (!maintenance) {
      return addCorsHeaders(NextResponse.json({ message: 'Not found' }, { status: 404 }));
    }

    return addCorsHeaders(NextResponse.json(maintenance));
  } catch (error: any) {
    console.error('Error fetching maintenance request (external):', error);
    const errorResponse = NextResponse.json(
      { message: error.message || 'Failed to fetch maintenance request' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
