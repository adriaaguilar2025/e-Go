// Acceso a BD para usuarios: buscar por email y crear usuario
const { pool, USUARIOS_TABLE, AMIGOS_TABLE } = require('../lib/db');

async function getFriends(userId) {
  const result = await pool.query(
    `SELECT
       CASE
         WHEN usuari_id1 = $1 THEN usuari_id2
         ELSE usuari_id1
       END AS id
     FROM ${AMIGOS_TABLE}
     WHERE usuari_id1 = $1 OR usuari_id2 = $1;`,
    [userId]
  );
  return result.rows;
}

async function addFriend(userId1, userId2) {
  const result = await pool.query(
    `INSERT INTO ${AMIGOS_TABLE} (usuari_id1, usuari_id2)
     VALUES ( LEAST($1, $2), GREATEST($1, $2) )
     RETURNING usuari_id1, usuari_id2;`,
    [userId1, userId2]
  );
  return result.rows[0];
}

module.exports = {
  getFriends,
  addFriend,
};
