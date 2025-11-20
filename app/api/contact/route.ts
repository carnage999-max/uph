import { Resend } from 'resend';

function escapeHtml(raw: string){
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, aboutProperty, aboutUnit } = await req.json();
    if(!name || !email || !message) return new Response(JSON.stringify({error:'Missing fields'}), { status: 400 });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.CONTACT_FROM || 'UPH Website <onboarding@resend.dev>';
    const internalRecipient = process.env.CONTACT_TO || 'info@ultimatepropertyholdings.com';
    const siteOrigin = process.env.APP_ORIGIN || 'https://ultimatepropertyholdings.com';
    const logoUrl = new URL('/logo/uph.jpeg', siteOrigin).toString();
    const escapedMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const subj: string[] = ['UPH Website Inquiry'];
    if(aboutProperty) subj.push(`Property: ${aboutProperty}`);
    if(aboutUnit) subj.push(`Unit: ${aboutUnit}`);
    const subject = subj.join(' — ') + ` — ${name}`;
    const text = `Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
${aboutProperty ? `Property: ${aboutProperty}
` : ''}${aboutUnit ? `Unit: ${aboutUnit}
` : ''}
Message:
${message}`;
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
                  <p style="margin:0 0 12px;">You have a new inquiry from <strong>${escapeHtml(name)}</strong>.</p>
                  ${aboutProperty ? `<p style="margin:0 0 8px;"><strong>Property:</strong> ${escapeHtml(aboutProperty)}</p>` : ''}
                  ${aboutUnit ? `<p style="margin:0 0 8px;"><strong>Unit:</strong> ${escapeHtml(aboutUnit)}</p>` : ''}
                  <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#111827;">${escapeHtml(email)}</a></p>
                  ${phone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color:#111827;">${escapeHtml(phone)}</a></p>` : ''}
                  <p style="margin:24px 0 4px;font-weight:600;">Message</p>
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">${escapedMessage}</div>
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
      subject, text, html,
    });

    const userSubject = `We received your message${aboutProperty ? ` about ${aboutProperty}` : ''} — Ultimate Property Holdings`;
    const userText = `Hi ${name},

Thanks for reaching out to Ultimate Property Holdings. This email confirms we received your message${aboutProperty ? ` regarding ${aboutProperty}${aboutUnit ? ` (${aboutUnit})` : ''}` : ''}.

Here is a copy for your records:

${message}

We will follow up shortly${phone ? ` at ${phone}` : ''}. If you need to add anything, just reply to this email.

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
                  <p style="margin:0 0 16px;">Thanks for reaching out to Ultimate Property Holdings. We received your message${aboutProperty ? ` regarding <strong>${escapeHtml(aboutProperty)}${aboutUnit ? ` — ${escapeHtml(aboutUnit)}` : ''}</strong>` : ''} and a member of our team will follow up shortly${phone ? ` at <a href="tel:${escapeHtml(phone)}" style="color:#111827;">${escapeHtml(phone)}</a>` : ''}.</p>
                  <p style="margin:24px 0 8px;font-weight:600;">Here’s a copy for your records:</p>
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">${escapedMessage}</div>
                  <p style="margin:24px 0 0;">Need to update details? Reply to this email and we’ll take it from there.</p>
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

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
