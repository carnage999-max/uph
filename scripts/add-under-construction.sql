-- Add underConstruction column if it doesn't exist
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
