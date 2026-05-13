CREATE TABLE IF NOT EXISTS ego.station_requests (
  id                   SERIAL PRIMARY KEY,
  empresa_id           INTEGER NOT NULL REFERENCES ego.empresas(user_id) ON DELETE CASCADE,
  station_id           INTEGER REFERENCES ego.estaciones(id) ON DELETE SET NULL,
  action               VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  status               VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payload              JSONB NOT NULL DEFAULT '{}'::jsonb,
  rejection_reason     TEXT,
  reviewed_by_admin_id INTEGER REFERENCES ego.admins(user_id) ON DELETE SET NULL,
  reviewed_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS station_requests_updated_at ON ego.station_requests;
CREATE TRIGGER station_requests_updated_at
  BEFORE UPDATE ON ego.station_requests
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
