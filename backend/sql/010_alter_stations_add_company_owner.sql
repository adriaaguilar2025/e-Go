ALTER TABLE ego.estaciones
  ADD COLUMN IF NOT EXISTS owner_company_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'estaciones_owner_company_id_fkey'
  ) THEN
    ALTER TABLE ego.estaciones
      ADD CONSTRAINT estaciones_owner_company_id_fkey
      FOREIGN KEY (owner_company_id) REFERENCES ego.empresas(id)
      ON DELETE SET NULL;
  END IF;
END $$;
