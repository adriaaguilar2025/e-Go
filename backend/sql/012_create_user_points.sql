-- Script para añadir columna de puntos a la tabla de usuarios
-- Esta columna almacena los puntos totales ganados por cada usuario através de sesiones de carga
-- Como ejecutar: psql -U postgres -d nombre_de_tu_bd -f 012_create_user_points.sql

CREATE SCHEMA IF NOT EXISTS ego;

-- Añadir columna de puntos a la tabla usuari si no existe
ALTER TABLE ego.usuari
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

