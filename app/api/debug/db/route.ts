import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[test-db] Testing database connection...');
    
    const count = await prisma.property.count();
    console.log('[test-db] Property count:', count);
    
    const properties = await prisma.property.findMany({
      take: 3,
      select: { id: true, name: true, slug: true },
    });
    
    console.log('[test-db] Sample properties:', properties);
    
    return Response.json({
      success: true,
      propertyCount: count,
      sampleProperties: properties,
      message: 'Database connection successful',
    });
  } catch (error) {
    console.error('[test-db] Error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : 'N/A',
      },
      { status: 500 }
    );
  }
}
