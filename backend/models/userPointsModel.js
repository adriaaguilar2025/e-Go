const { pool } = require('../lib/db');

// Obtener puntos de un usuario
async function getUserPoints(usuariId) {
  const result = await pool.query(
    'SELECT id, points FROM ego.usuari WHERE id = $1',
    [usuariId]
  );

  if (result.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  return {
    usuari_id: result.rows[0].id,
    puntos_totales: result.rows[0].points
  };
}

// Añadir puntos a un usuario
async function addPoints(usuariId, puntosGanados) {
  const query = `
    UPDATE ego.usuari
    SET points = points + $2
    WHERE id = $1
    RETURNING id, points;
  `;
  const result = await pool.query(query, [usuariId, puntosGanados]);

  if (result.rows.length === 0) {
    throw new Error('No se pudo actualizar los puntos del usuario');
  }

  return result.rows[0];
}

// Obtener ranking de usuarios por puntos
async function getLeaderboard(limit = 10, offset = 0) {
  const query = `
    SELECT 
      id as usuari_id,
      username,
      points as puntos_totales
    FROM ego.usuari
    WHERE points > 0
    ORDER BY points DESC
    LIMIT $1 OFFSET $2;
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
}

// Obtener posición de un usuario en el ranking
async function getUserRanking(usuariId) {
  const query = `
    SELECT 
      COUNT(*) + 1 as posicion
    FROM ego.usuari
    WHERE points > (SELECT points FROM ego.usuari WHERE id = $1);
  `;
  const result = await pool.query(query, [usuariId]);
  return result.rows[0]?.posicion || 0;
}

module.exports = {
  getUserPoints,
  addPoints,
  getLeaderboard,
  getUserRanking
};

