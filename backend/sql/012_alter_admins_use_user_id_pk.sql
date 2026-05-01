-- Refactor admins: use inherited user_id as the primary key.
-- Safe for existing databases that still have a SERIAL id column.

CREATE SCHEMA IF NOT EXISTS ego;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'ego'
      AND table_name = 'admins'
  ) THEN
    -- If legacy schema exists, remove PK on id.
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'ego'
        AND table_name = 'admins'
        AND column_name = 'id'
    ) THEN
      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'ego.admins'::regclass
          AND contype = 'p'
      ) THEN
        ALTER TABLE ego.admins DROP CONSTRAINT admins_pkey;
      END IF;

      ALTER TABLE ego.admins DROP COLUMN id;
    END IF;

    -- Ensure user_id is not nullable before making it PK.
    ALTER TABLE ego.admins
      ALTER COLUMN user_id SET NOT NULL;

    -- Add PK on user_id only if it does not exist yet.
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'ego.admins'::regclass
        AND contype = 'p'
    ) THEN
      ALTER TABLE ego.admins
        ADD CONSTRAINT admins_pkey PRIMARY KEY (user_id);
    END IF;
  END IF;
END $$;
