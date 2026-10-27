import { readFile } from 'node:fs/promises';
import { Resend } from 'resend';

const payloadPath = process.argv[2];
const siteOrigin = 'https://atlasproperties.net';
const recipient = 'nathan@membershipauto.com';

if (!payloadPath) {
  throw new Error('Usage: node scripts/resend-application-email.mjs /path/to/application-email.json');
}

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required. Run this inside the application container.');
}

const payload = JSON.parse(await readFile(payloadPath, 'utf8'));

if (!payload.from || !payload.subject || !payload.html || !payload.text) {
  throw new Error('The input JSON must include from, subject, html, and text.');
}

const toAbsoluteMediaUrl = (content) =>
  content.replace(/(?<!https:\/\/atlasproperties\.net)\/media\//g, `${siteOrigin}/media/`);

const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
  from: payload.from,
  to: [recipient],
  subject: payload.subject,
  html: toAbsoluteMediaUrl(payload.html),
  text: toAbsoluteMediaUrl(payload.text),
});

if (error) {
  throw new Error(error.message);
}

console.log(`Application email sent to ${recipient}. Resend email ID: ${data?.id ?? 'unknown'}`);
