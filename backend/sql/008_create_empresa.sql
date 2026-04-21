-- Tabla de empresas autorizadas para gestionar estaciones manuales

CREATE SCHEMA IF NOT EXISTS ego;

CREATE TABLE IF NOT EXISTS ego.empresas (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES ego.usuari(id) ON DELETE CASCADE,
  nombre     VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
