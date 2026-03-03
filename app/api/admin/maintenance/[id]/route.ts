import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { uploadFileToS3 } from '@/lib/storage';
import { sendMaintenanceStatusUpdateEmail } from '@/lib/email-notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type');

    let status: string;
    let comment: string | undefined;
    let commentAttachmentUrl: string | null = null;
    let commentAttachmentKey: string | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
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
          return NextResponse.json({ message: error.message || 'Unable to upload attachment.' }, { status: 500 });
        }
      }
    } else {
      // Handle JSON
      const body = await request.json();
      status = body.status;
      comment = body.comment;
    }

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    // Get the current request to fetch email
    const currentRequest = await prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!currentRequest) {
      return NextResponse.json({ message: 'Maintenance request not found' }, { status: 404 });
    }

    // Update the request
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

    // Send email notification if status changed and email exists
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
        console.error('Error sending status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating maintenance request:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update maintenance request' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const maintenance = await prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!maintenance) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(maintenance);
  } catch (error: any) {
    console.error('Error fetching maintenance request:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch maintenance request' },
      { status: 500 }
    );
  }
}
