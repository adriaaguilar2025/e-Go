-- Ensure admin reference fields point to ego.admins(user_id), not ego.usuari(id).

CREATE SCHEMA IF NOT EXISTS ego;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'ego'
      AND table_name = 'estaciones'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'estaciones_created_by_admin_id_fkey'
    ) THEN
      ALTER TABLE ego.estaciones
        DROP CONSTRAINT estaciones_created_by_admin_id_fkey;
    END IF;

    ALTER TABLE ego.estaciones
      ADD CONSTRAINT estaciones_created_by_admin_id_fkey
      FOREIGN KEY (created_by_admin_id) REFERENCES ego.admins(user_id)
      ON DELETE SET NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'ego'
      AND table_name = 'station_requests'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'station_requests_reviewed_by_admin_id_fkey'
    ) THEN
      ALTER TABLE ego.station_requests
        DROP CONSTRAINT station_requests_reviewed_by_admin_id_fkey;
    END IF;

    ALTER TABLE ego.station_requests
      ADD CONSTRAINT station_requests_reviewed_by_admin_id_fkey
      FOREIGN KEY (reviewed_by_admin_id) REFERENCES ego.admins(user_id)
      ON DELETE SET NULL;
  END IF;
END $$;
