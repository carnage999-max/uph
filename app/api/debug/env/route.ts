export async function GET() {
  return Response.json({
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_DATABASE_URL: process.env.NEXT_PUBLIC_DATABASE_URL ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 25),
    timestamp: new Date().toISOString(),
  });
}
