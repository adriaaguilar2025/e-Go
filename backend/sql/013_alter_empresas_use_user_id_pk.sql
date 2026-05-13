-- Refactor empresas: use inherited user_id as the primary key.
-- Also remap dependent foreign keys from legacy empresas.id values.

CREATE SCHEMA IF NOT EXISTS ego;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'ego'
      AND table_name = 'empresas'
  ) THEN
    -- Drop dependent FK constraints to allow remapping.
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'estaciones_owner_company_id_fkey'
    ) THEN
      ALTER TABLE ego.estaciones DROP CONSTRAINT estaciones_owner_company_id_fkey;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'station_requests_empresa_id_fkey'
    ) THEN
      ALTER TABLE ego.station_requests DROP CONSTRAINT station_requests_empresa_id_fkey;
    END IF;

    -- If legacy id exists, remap child references from empresas.id -> empresas.user_id.
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'ego'
        AND table_name = 'empresas'
        AND column_name = 'id'
    ) THEN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'ego'
          AND table_name = 'estaciones'
      ) THEN
        UPDATE ego.estaciones s
        SET owner_company_id = e.user_id
        FROM ego.empresas e
        WHERE s.owner_company_id = e.id;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'ego'
          AND table_name = 'station_requests'
      ) THEN
        UPDATE ego.station_requests sr
        SET empresa_id = e.user_id
        FROM ego.empresas e
        WHERE sr.empresa_id = e.id;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'ego.empresas'::regclass
          AND contype = 'p'
      ) THEN
        ALTER TABLE ego.empresas DROP CONSTRAINT empresas_pkey;
      END IF;

      ALTER TABLE ego.empresas DROP COLUMN id;
    END IF;

    ALTER TABLE ego.empresas
      ALTER COLUMN user_id SET NOT NULL;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'ego.empresas'::regclass
        AND contype = 'p'
    ) THEN
      ALTER TABLE ego.empresas
        ADD CONSTRAINT empresas_pkey PRIMARY KEY (user_id);
    END IF;

    -- Recreate dependent foreign keys against empresas(user_id).
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'ego'
        AND table_name = 'estaciones'
    ) AND NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'estaciones_owner_company_id_fkey'
    ) THEN
      ALTER TABLE ego.estaciones
        ADD CONSTRAINT estaciones_owner_company_id_fkey
        FOREIGN KEY (owner_company_id) REFERENCES ego.empresas(user_id)
        ON DELETE SET NULL;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'ego'
        AND table_name = 'station_requests'
    ) AND NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'station_requests_empresa_id_fkey'
    ) THEN
      ALTER TABLE ego.station_requests
        ADD CONSTRAINT station_requests_empresa_id_fkey
        FOREIGN KEY (empresa_id) REFERENCES ego.empresas(user_id)
        ON DELETE CASCADE;
    END IF;
  END IF;
END $$;
