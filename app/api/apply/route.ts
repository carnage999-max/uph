import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { uploadFileToS3 } from '@/lib/storage';
import { generateApplicationPDF } from '@/lib/pdf-generator';

function escapeHtml(raw: string){
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract text fields
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const dateOfBirth = String(formData.get('dateOfBirth') || '').trim();
    const ssn = String(formData.get('ssn') || '').trim();
    const currentAddress = String(formData.get('currentAddress') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const state = String(formData.get('state') || '').trim();
    const zipCode = String(formData.get('zipCode') || '').trim();
    const landlordName = String(formData.get('landlordName') || '').trim();
    const landlordPhone = String(formData.get('landlordPhone') || '').trim();
    const landlordEmail = String(formData.get('landlordEmail') || '').trim();
    const jobTitle = String(formData.get('jobTitle') || '').trim();
    const employerName = String(formData.get('employerName') || '').trim();
    const monthlyIncome = String(formData.get('monthlyIncome') || '').trim();
    const property = String(formData.get('property') || '').trim();
    const unit = String(formData.get('unit') || '').trim();
    const additionalNotes = String(formData.get('additionalNotes') || '').trim();
    const hasPet = String(formData.get('hasPet') || 'false') === 'true';
    const petType = String(formData.get('petType') || '').trim();
    const authorizeCriminalCheck = String(formData.get('authorizeCriminalCheck') || 'false') === 'true';
    const authorizeCreditCheck = String(formData.get('authorizeCreditCheck') || 'false') === 'true';
    const signature = String(formData.get('signature') || '').trim();
    const captchaToken = String(formData.get('captchaToken') || '').trim();
    const referencesJson = String(formData.get('references') || '[]');
    
    // Parse references
    let references: Array<{name: string; relationship: string; phone: string; email: string}> = [];
    try {
      references = JSON.parse(referencesJson);
    } catch (e) {
      // If parsing fails, use empty array
    }

    // Verify CAPTCHA (optional - you can add server-side verification here)
    if (!captchaToken) {
      return new Response(JSON.stringify({error:'CAPTCHA verification required'}), { status: 400 });
    }

    // Required fields validation
    if(!firstName || !lastName || !email || !phone || !dateOfBirth || !ssn || !monthlyIncome || !property) {
      return new Response(JSON.stringify({error:'Missing required fields'}), { status: 400 });
    }

    if (!authorizeCriminalCheck || !authorizeCreditCheck) {
      return new Response(JSON.stringify({error:'Both authorizations are required'}), { status: 400 });
    }

    if (!signature) {
      return new Response(JSON.stringify({error:'Signature is required'}), { status: 400 });
    }

    // Handle file uploads
    let petPhotoUrl: string | null = null;
    let petPhotoKey: string | null = null;
    let driversLicenseUrl: string | null = null;
    let driversLicenseKey: string | null = null;

    const petPhoto = formData.get('petPhoto');
    if (petPhoto instanceof File && petPhoto.size > 0) {
      try {
        const upload = await uploadFileToS3(petPhoto, `applications/${Date.now()}/pet-photo`);
        petPhotoUrl = upload.url;
        petPhotoKey = upload.key;
      } catch (error: any) {
        console.error('Error uploading pet photo:', error);
        // Continue without pet photo if upload fails
      }
    }

    const driversLicensePhoto = formData.get('driversLicensePhoto');
    if (driversLicensePhoto instanceof File && driversLicensePhoto.size > 0) {
      try {
        const upload = await uploadFileToS3(driversLicensePhoto, `applications/${Date.now()}/drivers-license`);
        driversLicenseUrl = upload.url;
        driversLicenseKey = upload.key;
      } catch (error: any) {
        return new Response(JSON.stringify({error: 'Failed to upload driver\'s license photo'}), { status: 500 });
      }
    } else {
      return new Response(JSON.stringify({error:'Driver\'s license photo is required'}), { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.CONTACT_FROM || 'Ultimate Property Holdings <properties@nathanreardon.com>';
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

Current Landlord:
• Name: ${landlordName || 'N/A'}
• Phone: ${landlordPhone || 'N/A'}
• Email: ${landlordEmail || 'N/A'}

Personal References:
${references.map((ref, i) => `
Reference ${i + 1}:
• Name: ${ref.name}
• Relationship: ${ref.relationship}
• Phone: ${ref.phone}
• Email: ${ref.email || 'N/A'}
`).join('\n')}

Pet Information:
• Has Pet: ${hasPet ? 'Yes' : 'No'}
${hasPet ? `• Pet Type: ${petType || 'N/A'}` : ''}
${petPhotoUrl ? `• Pet Photo: ${petPhotoUrl}` : ''}

Employment:
• Job Title: ${jobTitle || 'N/A'}
• Employer: ${employerName || 'N/A'}
• Monthly Income: $${monthlyIncome}

Property Interest:
• Property: ${property}
${unit ? `• Unit: ${unit}` : ''}

Authorizations:
• Criminal Background Check: ${authorizeCriminalCheck ? 'Authorized' : 'Not Authorized'}
• Credit Check: ${authorizeCreditCheck ? 'Authorized' : 'Not Authorized'}

${driversLicenseUrl ? `Driver's License: ${driversLicenseUrl}` : ''}
${signature ? 'Signature: Provided' : ''}

${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}
    `.trim();

    // Build HTML email
    const referencesHtml = references.map((ref, i) => `
      <div style="margin-bottom:12px;padding:12px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
        <strong>Reference ${i + 1}:</strong><br />
        Name: ${escapeHtml(ref.name)}<br />
        Relationship: ${escapeHtml(ref.relationship)}<br />
        Phone: ${escapeHtml(ref.phone)}<br />
        Email: ${escapeHtml(ref.email || 'N/A')}
      </div>
    `).join('');

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

                  ${landlordName || landlordPhone || landlordEmail ? `
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Current Landlord</h3>
                    <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(landlordName || 'N/A')}</p>
                    <p style="margin:4px 0;"><strong>Phone:</strong> ${escapeHtml(landlordPhone || 'N/A')}</p>
                    <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(landlordEmail || 'N/A')}</p>
                  </div>
                  ` : ''}

                  ${references.length > 0 ? `
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Personal References</h3>
                    ${referencesHtml}
                  </div>
                  ` : ''}

                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Pet Information</h3>
                    <p style="margin:4px 0;"><strong>Has Pet:</strong> ${hasPet ? 'Yes' : 'No'}</p>
                    ${hasPet ? `<p style="margin:4px 0;"><strong>Pet Type:</strong> ${escapeHtml(petType || 'N/A')}</p>` : ''}
                    ${petPhotoUrl ? `<p style="margin:4px 0;"><strong>Pet Photo:</strong> <a href="${petPhotoUrl}" style="color:#111827;">View Photo</a></p>` : ''}
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

                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Authorizations</h3>
                    <p style="margin:4px 0;"><strong>Criminal Background Check:</strong> ${authorizeCriminalCheck ? '✓ Authorized' : '✗ Not Authorized'}</p>
                    <p style="margin:4px 0;"><strong>Credit Check:</strong> ${authorizeCreditCheck ? '✓ Authorized' : '✗ Not Authorized'}</p>
                  </div>

                  ${driversLicenseUrl ? `
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">Driver's License</h3>
                    <p style="margin:4px 0;"><a href="${driversLicenseUrl}" style="color:#111827;text-decoration:underline;">View Driver's License Photo</a></p>
                  </div>
                  ` : ''}

                  ${signature ? `
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">E-Signature</h3>
                    <p style="margin:4px 0;">Signature provided and verified</p>
                    <img src="${signature}" alt="Applicant Signature" style="max-width:300px;border:1px solid #e5e7eb;border-radius:8px;margin-top:8px;" />
                  </div>
                  ` : ''}

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

    // Generate PDF (non-blocking - if it fails, emails still send)
    let pdfBuffer: Buffer | null = null;
    try {
      const pdfData = {
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
        landlordName,
        landlordPhone,
        landlordEmail,
        references,
        hasPet,
        petType,
        jobTitle,
        employerName,
        monthlyIncome,
        property,
        unit,
        additionalNotes,
        authorizeCriminalCheck,
        authorizeCreditCheck,
        submittedAt: new Date().toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          dateStyle: 'long',
          timeStyle: 'short'
        }),
      };
      pdfBuffer = await generateApplicationPDF(pdfData);
      console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
    } catch (pdfError: any) {
      console.error('Failed to generate PDF:', pdfError);
      console.error('PDF Error details:', pdfError.message, pdfError.stack);
      // Continue without PDF - don't break email sending
    }

    // Prepare attachments
    const attachments = [];
    if (pdfBuffer) {
      // Sanitize filename
      const sanitizedName = `${firstName}-${lastName}`.replace(/[^a-zA-Z0-9-]/g, '_');
      const filename = `application-${sanitizedName}-${Date.now()}.pdf`;
      // Resend requires base64 encoded content
      attachments.push({
        filename,
        content: pdfBuffer.toString('base64'),
      });
      console.log(`PDF attachment prepared: ${filename}, base64 length: ${pdfBuffer.toString('base64').length}`);
    } else {
      console.log('No PDF buffer available, sending email without attachment');
    }

    // Send to internal recipient
    await resend.emails.send({
      from: fromAddress,
      to: [internalRecipient],
      subject,
      text: applicationData,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
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
    console.error('Application submission error:', e);
    return new Response(JSON.stringify({ error: e.message || 'An error occurred processing your application' }), { status: 500 });
  }
}
