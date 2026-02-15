import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/storage';

function escapeHtml(raw: string){
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest){
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const issueType = String(formData.get('issueType') || '').trim();
  const entryPermission = String(formData.get('entryPermission') || 'yes').trim();
  const description = String(formData.get('description') || '').trim();
  const email = String(formData.get('email') || '').trim();

  if (!name || !phone || !address || !issueType || !description){
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
  }

  let attachmentUrl: string | null = null;
  let attachmentKey: string | null = null;
  const media = formData.get('media');

  if (media instanceof File && media.size > 0){
    try {
      const upload = await uploadFileToS3(media, `maintenance/${Date.now()}`);
      attachmentUrl = upload.url;
      attachmentKey = upload.key;
    } catch (error: any) {
      return NextResponse.json({ message: error.message || 'Unable to upload attachment.' }, { status: 500 });
    }
  }

  const record = await prisma.maintenanceRequest.create({
    data: {
      name,
      phone,
      address,
      issueType,
      entryPermission,
      description,
      attachmentUrl,
      attachmentKey,
    },
  });

  // Send confirmation emails
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.CONTACT_FROM || 'Ultimate Property Holdings <properties@nathanreardon.com>';
    const internalRecipient = process.env.CONTACT_TO || 'info@ultimatepropertyholdings.com';
    const siteOrigin = process.env.APP_ORIGIN || 'https://ultimatepropertyholdings.com';
    const logoUrl = new URL('/logo/uph.jpeg', siteOrigin).toString();
    const escapedDescription = escapeHtml(description).replace(/\n/g, '<br />');

    const subject = `Maintenance Request — ${name} — ${address}`;
    const text = `Name: ${name}
Phone: ${phone}
Address: ${address}
Issue Type: ${issueType}
Entry Permission: ${entryPermission}
${attachmentUrl ? `Attachment: ${attachmentUrl}` : ''}

Description:
${description}`;

    const html = `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:32px 0;">
        <tr>
          <td align="center">
            <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;padding:32px;font-family:'Open Sans',Arial,sans-serif;color:#111827;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <img src="${logoUrl}" alt="Ultimate Property Holdings" width="80" height="80" style="border-radius:16px;object-fit:cover;display:block;" />
                  <div style="margin-top:12px;font-size:20px;font-weight:700;font-family:'Montserrat',Arial,sans-serif;">Ultimate Property Holdings</div>
                </td>
              </tr>
              <tr>
                <td style="font-size:16px;line-height:1.6;">
                  <p style="margin:0 0 12px;">New maintenance request from <strong>${escapeHtml(name)}</strong>.</p>
                  <p style="margin:0 0 8px;"><strong>Ticket ID:</strong> ${record.id}</p>
                  <p style="margin:0 0 8px;"><strong>Address:</strong> ${escapeHtml(address)}</p>
                  <p style="margin:0 0 8px;"><strong>Issue Type:</strong> ${escapeHtml(issueType)}</p>
                  <p style="margin:0 0 8px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color:#111827;">${escapeHtml(phone)}</a></p>
                  <p style="margin:0 0 8px;"><strong>Entry Permission:</strong> ${escapeHtml(entryPermission)}</p>
                  ${attachmentUrl ? `<p style="margin:0 0 8px;"><strong>Attachment:</strong> <a href="${escapeHtml(attachmentUrl)}" style="color:#0066cc;">${escapeHtml(attachmentUrl)}</a></p>` : ''}
                  <p style="margin:24px 0 4px;font-weight:600;">Description</p>
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">${escapedDescription}</div>
                </td>
              </tr>
              <tr>
                <td style="padding-top:28px;font-size:12px;color:#6b7280;text-align:center;">
                  © ${new Date().getFullYear()} Ultimate Property Holdings. PO Box 52, Detroit, ME 04929.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    await resend.emails.send({
      from: fromAddress,
      to: [internalRecipient],
      subject,
      text,
      html,
    });

    // Send user confirmation email if email provided
    if (email) {
      const userSubject = `Maintenance Request Received — Ultimate Property Holdings`;
      const userText = `Hi ${name},

Thank you for submitting a maintenance request. We have received your request and our team will review it shortly.

Ticket ID: ${record.id}
Address: ${address}
Issue Type: ${issueType}

We will contact you at ${phone} to schedule a time that works best for you.

— Ultimate Property Holdings`;

      const userHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:32px 0;">
          <tr>
            <td align="center">
              <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;padding:32px;font-family:'Open Sans',Arial,sans-serif;color:#111827;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <img src="${logoUrl}" alt="Ultimate Property Holdings" width="80" height="80" style="border-radius:16px;object-fit:cover;display:block;" />
                    <div style="margin-top:12px;font-size:20px;font-weight:700;font-family:'Montserrat',Arial,sans-serif;">Ultimate Property Holdings</div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:16px;line-height:1.6;">
                    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
                    <p style="margin:0 0 16px;">Thank you for submitting a maintenance request. We have received your submission and our team will review it shortly.</p>
                    <table cellpadding="12" cellspacing="0" role="presentation" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;width:100%;margin:24px 0;">
                      <tr>
                        <td style="font-size:14px;border-bottom:1px solid #e5e7eb;"><strong>Ticket ID</strong></td>
                        <td style="font-size:14px;border-bottom:1px solid #e5e7eb;font-family:'Courier New',monospace;color:#0066cc;">${record.id}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;border-bottom:1px solid #e5e7eb;"><strong>Address</strong></td>
                        <td style="font-size:14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(address)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;"><strong>Issue Type</strong></td>
                        <td style="font-size:14px;">${escapeHtml(issueType)}</td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0;">We will contact you at <a href="tel:${escapeHtml(phone)}" style="color:#0066cc;">${escapeHtml(phone)}</a> to schedule a time that works best for you.</p>
                    <p style="margin:16px 0 0;">— Ultimate Property Holdings</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:28px;font-size:12px;color:#6b7280;text-align:center;">
                    PO Box 52, Detroit, ME 04929 • <a href="tel:2079471999" style="color:#6b7280;">207-947-1999</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

      await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: userSubject,
        text: userText,
        html: userHtml,
      });
    }
  } catch (emailError: any) {
    console.error('Email sending error:', emailError);
    // Don't fail the request if email fails, but log it
  }

  return NextResponse.json({ success: true, ticketId: record.id });
}
