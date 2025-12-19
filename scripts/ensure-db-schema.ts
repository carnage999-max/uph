import { prisma } from '../lib/prisma';

async function ensureUnderConstructionColumn() {
  try {
    console.log('Checking if underConstruction column exists...');
    
    // Try to query the column - if it fails, we know it doesn't exist
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Property' AND column_name='underConstruction'
    ` as any[];

    if (result && result.length > 0) {
      console.log('✓ underConstruction column already exists');
      return;
    }

    console.log('Column does not exist, creating it...');
    
    // Add the column with default value false
    await prisma.$executeRaw`
      ALTER TABLE "Property" 
      ADD COLUMN "underConstruction" BOOLEAN NOT NULL DEFAULT false
    `;

    console.log('✓ Successfully created underConstruction column');
  } catch (error: any) {
    if (error.code === '42701' || error.message?.includes('already exists')) {
      console.log('✓ Column already exists (or other schema is correct)');
    } else {
      console.error('Error ensuring database schema:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

ensureUnderConstructionColumn()
  .then(() => {
    console.log('Database schema check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to ensure database schema:', error);
    process.exit(1);
  });
