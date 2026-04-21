const { pool, EMPRESAS_TABLE, USUARIOS_TABLE } = require('../lib/db');

async function findCompanyByEmail(email) {
  const result = await pool.query(
    `SELECT e.id, e.user_id, e.nombre, e.created_at, u.email, u.username
     FROM ${EMPRESAS_TABLE} e
     JOIN ${USUARIOS_TABLE} u ON u.id = e.user_id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

module.exports = {
  findCompanyByEmail,
};
