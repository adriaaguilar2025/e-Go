--Script para gestionar los amigos de los usuarios
--Como ejecutar: psql -U postgres -d nombre_de_tu_bd (postgres) -f 016_create_amics.sql
-- psql -U postgres -d postgres -f .\backend\sql\016_create_amics.sql desde el inicio.
--Aseguramos que trabajamos sobre el esquema ego y no el public
CREATE SCHEMA IF NOT EXISTS ego;

CREATE TABLE IF NOT EXISTS ego.amics (
  usuari_id1   INTEGER NOT NULL,
  usuari_id2   INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (usuari_id1, usuari_id2),

    CHECK (usuari_id1 < usuari_id2), -- Para evitar duplicados y asegurar un orden

  --Ponemos las foreign keys para referenciar a los usuarios
  --Si se borra un usuario, se eliminan sus instancias de amigos con el CASCADE
  CONSTRAINT fk_usuari1
    FOREIGN KEY(usuari_id1)
    REFERENCES ego.usuari(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_usuari2
    FOREIGN KEY(usuari_id2)
    REFERENCES ego.usuari(id)
    ON DELETE CASCADE
);