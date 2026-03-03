import { Resend } from 'resend';

function escapeHtml(raw: string) {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStatusHeaderText(status: string): string {
  const headers: Record<string, string> = {
    'in-progress': '🔧 Your maintenance request is now in progress',
    completed: '✅ Your maintenance request has been completed',
    closed: '📋 Your maintenance request has been closed',
  };
  return headers[status] || 'Your maintenance request status has been updated';
}

function getStatusBodyText(status: string): string {
  const bodies: Record<string, string> = {
    'in-progress':
      'Our team has started working on your maintenance issue. We will contact you shortly if we need any additional information.',
    completed:
      'We have successfully completed the maintenance work on your property. Thank you for reporting the issue.',
    closed: 'Your maintenance request has been marked as closed. If you have any concerns, please contact us.',
  };
  return bodies[status] || 'Your maintenance request status has been updated.';
}

export async function sendMaintenanceStatusUpdateEmail({
  email,
  name,
  address,
  issueType,
  ticketId,
  status,
  comment,
  commentAttachmentUrl,
}: {
  email: string;
  name: string;
  address: string;
  issueType: string;
  ticketId: string;
  status: string;
  comment?: string;
  commentAttachmentUrl?: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress = process.env.CONTACT_FROM || 'Ultimate Property Holdings <properties@nathanreardon.com>';
  const siteOrigin = process.env.APP_ORIGIN || 'https://ultimatepropertyholdings.com';
  const logoUrl = new URL('/logo/uph.jpeg', siteOrigin).toString();
  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const headerText = getStatusHeaderText(status);
  const bodyText = getStatusBodyText(status);
  const escapedComment = comment ? escapeHtml(comment).replace(/\n/g, '<br />') : '';

  const text = `${headerText}

${bodyText}

Ticket ID: ${ticketId}
Address: ${address}
Issue Type: ${issueType}
Status Updated: ${timestamp}

${comment ? `Admin Comment:\n${comment}\n\n` : ''}
${commentAttachmentUrl ? `Attachment: ${commentAttachmentUrl}\n\n` : ''}
— Ultimate Property Holdings`;

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
                <p style="margin:0 0 16px;"><strong>${escapeHtml(headerText)}</strong></p>
                <p style="margin:0 0 16px;">${bodyText}</p>
                
                <table cellpadding="12" cellspacing="0" role="presentation" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;width:100%;margin:24px 0;">
                  <tr>
                    <td style="font-size:14px;border-bottom:1px solid #e5e7eb;"><strong>Ticket ID</strong></td>
                    <td style="font-size:14px;border-bottom:1px solid #e5e7eb;font-family:'Courier New',monospace;color:#0066cc;">${escapeHtml(ticketId)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;border-bottom:1px solid #e5e7eb;"><strong>Address</strong></td>
                    <td style="font-size:14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(address)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;border-bottom:1px solid #e5e7eb;"><strong>Issue Type</strong></td>
                    <td style="font-size:14px;border-bottom:1px solid #e5e7eb;">${escapeHtml(issueType)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;"><strong>Status Updated</strong></td>
                    <td style="font-size:14px;">${escapeHtml(timestamp)}</td>
                  </tr>
                </table>
                
                ${
                  comment
                    ? `<div style="background:#e8f4f8;border:1px solid #a8d4e0;border-radius:12px;padding:16px;margin:24px 0;">
                     <p style="margin:0 0 8px;font-weight:600;color:#0369a1;">Admin Comment</p>
                     <p style="margin:0;color:#0c4a6e;">${escapedComment}</p>
                   </div>`
                    : ''
                }
                
                ${
                  commentAttachmentUrl
                    ? `<p style="margin:16px 0 0;"><strong>Attachment:</strong> <a href="${escapeHtml(commentAttachmentUrl)}" style="color:#0066cc;">View attached file</a></p>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;font-size:12px;color:#6b7280;text-align:center;">
                © ${new Date().getFullYear()} Ultimate Property Holdings. PO Box 52, Detroit, ME 04929 • <a href="tel:2079471999" style="color:#6b7280;">207-947-1999</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: `Maintenance Request Update — ${headerText}`,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw error;
  }
}
