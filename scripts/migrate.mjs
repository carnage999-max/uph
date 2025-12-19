import { prisma } from '../lib/prisma.js';

async function addUnderConstructionColumn() {
  try {
    console.log('[Migration] Adding underConstruction column...');
    
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='Property' AND column_name='underConstruction'
          ) THEN
              ALTER TABLE "Property" ADD COLUMN "underConstruction" BOOLEAN NOT NULL DEFAULT false;
              RAISE NOTICE 'Column underConstruction added successfully';
          ELSE
              RAISE NOTICE 'Column underConstruction already exists';
          END IF;
      END $$;
    `);
    
    console.log('[Migration] Migration completed successfully');
  } catch (error) {
    console.error('[Migration] Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addUnderConstructionColumn();
