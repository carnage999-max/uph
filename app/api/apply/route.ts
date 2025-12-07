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
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      ssn,
      currentAddress,
      city,
      state,
      zipCode,
      jobTitle,
      employerName,
      monthlyIncome,
      property,
      unit,
      additionalNotes,
    } = await req.json();

    // Required fields validation
    if(!firstName || !lastName || !email || !phone || !dateOfBirth || !ssn || !monthlyIncome || !property) {
      return new Response(JSON.stringify({error:'Missing required fields'}), { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.CONTACT_FROM || 'UPH Website <onboarding@resend.dev>';
    const internalRecipient = process.env.CONTACT_TO || 'info@ultimatepropertyholdings.com';
    const siteOrigin = process.env.APP_ORIGIN || 'https://ultimatepropertyholdings.com';
    const logoUrl = new URL('/logo/uph.jpeg', siteOrigin).toString();

    const fullName = `${firstName} ${lastName}`;
    const subject = `New Rental Application — ${fullName} — ${property}${unit ? ` — ${unit}` : ''}`;

    // Format application data for email
    const applicationData = `
Personal Information:
• Name: ${fullName}
• Email: ${email}
• Phone: ${phone}
• Date of Birth: ${dateOfBirth}
• Social Security Number: ${ssn}

Current Address:
• Address: ${currentAddress || 'N/A'}
• City: ${city || 'N/A'}
• State: ${state || 'N/A'}
• ZIP Code: ${zipCode || 'N/A'}

Employment:
• Job Title: ${jobTitle || 'N/A'}
• Employer: ${employerName || 'N/A'}
• Monthly Income: $${monthlyIncome}

Property Interest:
• Property: ${property}
${unit ? `• Unit: ${unit}` : ''}

${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}
    `.trim();

    const html = `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:32px 0;">
        <tr>
          <td align="center">
            <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;padding:32px;font-family:'Open Sans',Arial,sans-serif;color:#111827;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <img src="${logoUrl}" alt="Ultimate Property Holdings" width="80" height="80" style="border-radius:16px;object-fit:cover;display:block;" />
                  <div style="margin-top:12px;font-size:20px;font-weight:700;font-family:'Montserrat',Arial,sans-serif;">New Rental Application</div>
                </td>
              </tr>
              <tr>
                <td style="font-size:16px;line-height:1.6;">
                  <p style="margin:0 0 20px;font-size:18px;font-weight:600;">Application from <strong>${escapeHtml(fullName)}</strong></p>
                  
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Personal Information</h3>
                    <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(fullName)}</p>
                    <p style="margin:4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#111827;">${escapeHtml(email)}</a></p>
                    <p style="margin:4px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color:#111827;">${escapeHtml(phone)}</a></p>
                    <p style="margin:4px 0;"><strong>Date of Birth:</strong> ${escapeHtml(dateOfBirth)}</p>
                    <p style="margin:4px 0;"><strong>Social Security Number:</strong> ${escapeHtml(ssn)}</p>
                  </div>

                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Current Address</h3>
                    <p style="margin:4px 0;"><strong>Address:</strong> ${escapeHtml(currentAddress || 'N/A')}</p>
                    <p style="margin:4px 0;"><strong>City:</strong> ${escapeHtml(city || 'N/A')}</p>
                    <p style="margin:4px 0;"><strong>State:</strong> ${escapeHtml(state || 'N/A')}</p>
                    <p style="margin:4px 0;"><strong>ZIP Code:</strong> ${escapeHtml(zipCode || 'N/A')}</p>
                  </div>

                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Employment Information</h3>
                    <p style="margin:4px 0;"><strong>Job Title:</strong> ${escapeHtml(jobTitle || 'N/A')}</p>
                    <p style="margin:4px 0;"><strong>Employer:</strong> ${escapeHtml(employerName || 'N/A')}</p>
                    <p style="margin:4px 0;"><strong>Monthly Income:</strong> $${escapeHtml(monthlyIncome.toString())}</p>
                  </div>

                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Property Interest</h3>
                    <p style="margin:4px 0;"><strong>Property:</strong> ${escapeHtml(property)}</p>
                    ${unit ? `<p style="margin:4px 0;"><strong>Unit:</strong> ${escapeHtml(unit)}</p>` : ''}
                  </div>

                  ${additionalNotes ? `
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Additional Notes</h3>
                    <p style="margin:0;white-space:pre-wrap;">${escapeHtml(additionalNotes).replace(/\n/g, '<br />')}</p>
                  </div>
                  ` : ''}
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

    // Send to internal recipient
    await resend.emails.send({
      from: fromAddress,
      to: [internalRecipient],
      subject,
      text: applicationData,
      html,
    });

    // Send confirmation to applicant
    const userSubject = `Application Received — Ultimate Property Holdings`;
    const userText = `Hi ${firstName},

Thank you for submitting your rental application for ${property}${unit ? ` (${unit})` : ''}. We have received your application and will review it promptly.

A member of our team will contact you shortly at ${phone} or ${email} to discuss next steps.

If you have any questions in the meantime, please don't hesitate to reach out.

Best regards,
Ultimate Property Holdings
PO Box 52, Detroit, ME 04929
207-947-1999`;

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
                  <p style="margin:0 0 16px;">Hi ${escapeHtml(firstName)},</p>
                  <p style="margin:0 0 16px;">Thank you for submitting your rental application for <strong>${escapeHtml(property)}${unit ? ` — ${escapeHtml(unit)}` : ''}</strong>. We have received your application and will review it promptly.</p>
                  <p style="margin:0 0 16px;">A member of our team will contact you shortly at <a href="tel:${escapeHtml(phone)}" style="color:#111827;">${escapeHtml(phone)}</a> or <a href="mailto:${escapeHtml(email)}" style="color:#111827;">${escapeHtml(email)}</a> to discuss next steps.</p>
                  <p style="margin:24px 0 0;">If you have any questions in the meantime, please don't hesitate to reach out.</p>
                  <p style="margin:16px 0 0;">Best regards,<br />Ultimate Property Holdings</p>
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

