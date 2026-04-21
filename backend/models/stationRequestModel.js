const { pool, STATION_REQUESTS_TABLE, EMPRESAS_TABLE, USUARIOS_TABLE } = require('../lib/db');
const stationModel = require('./stationModel');

async function createRequest({ empresaId, stationId = null, action, payload = {} }) {
  const result = await pool.query(
    `INSERT INTO ${STATION_REQUESTS_TABLE} (empresa_id, station_id, action, payload)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING *`,
    [empresaId, stationId, action, JSON.stringify(payload)]
  );
  return result.rows[0];
}

async function getPendingRequests() {
  const result = await pool.query(
    `SELECT sr.*, e.nombre AS empresa_nombre, u.email AS empresa_email, u.username AS empresa_username
     FROM ${STATION_REQUESTS_TABLE} sr
     JOIN ${EMPRESAS_TABLE} e ON e.id = sr.empresa_id
     JOIN ${USUARIOS_TABLE} u ON u.id = e.user_id
     WHERE sr.status = 'pending'
     ORDER BY sr.created_at ASC`
  );
  return result.rows;
}

async function getRequestsByCompany(empresaId) {
  const result = await pool.query(
    `SELECT *
     FROM ${STATION_REQUESTS_TABLE}
     WHERE empresa_id = $1
     ORDER BY created_at DESC`,
    [empresaId]
  );
  return result.rows;
}

async function getRequestById(id) {
  const result = await pool.query(
    `SELECT *
     FROM ${STATION_REQUESTS_TABLE}
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function approveRequest({ requestId, adminUserId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const requestResult = await client.query(
      `SELECT *
       FROM ${STATION_REQUESTS_TABLE}
       WHERE id = $1
       FOR UPDATE`,
      [requestId]
    );
    const request = requestResult.rows[0];
    if (!request) {
      await client.query('ROLLBACK');
      return null;
    }
    if (request.status !== 'pending') {
      const err = new Error('La solicitud ya fue resuelta');
      err.code = 'REQUEST_ALREADY_RESOLVED';
      throw err;
    }

    let station = null;
    if (request.action === 'create') {
      station = await stationModel.createManualStation(
        {
          ...request.payload,
          owner_company_id: request.empresa_id,
          created_by_admin_id: null,
        },
        client
      );
    } else if (request.action === 'update') {
      station = await stationModel.updateCompanyOwnedManualStation(
        request.station_id,
        request.empresa_id,
        request.payload,
        client
      );
      if (!station) {
        const err = new Error('La estacion a modificar ya no existe o no pertenece a la empresa');
        err.code = 'STATION_NOT_FOUND';
        throw err;
      }
    } else if (request.action === 'delete') {
      station = await stationModel.deleteCompanyOwnedManualStation(
        request.station_id,
        request.empresa_id,
        client
      );
      if (!station) {
        const err = new Error('La estacion a borrar ya no existe o no pertenece a la empresa');
        err.code = 'STATION_NOT_FOUND';
        throw err;
      }
    } else {
      const err = new Error('Accion de solicitud no soportada');
      err.code = 'INVALID_ACTION';
      throw err;
    }

    const updatedResult = await client.query(
      `UPDATE ${STATION_REQUESTS_TABLE}
       SET status = 'approved',
           reviewed_at = NOW(),
           reviewed_by_admin_id = $2,
           rejection_reason = NULL,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [requestId, adminUserId]
    );

    await client.query('COMMIT');
    return { request: updatedResult.rows[0], station };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function rejectRequest({ requestId, adminUserId, rejectionReason = null }) {
  const result = await pool.query(
    `UPDATE ${STATION_REQUESTS_TABLE}
     SET status = 'rejected',
         reviewed_at = NOW(),
         reviewed_by_admin_id = $2,
         rejection_reason = $3,
         updated_at = NOW()
     WHERE id = $1 AND status = 'pending'
     RETURNING *`,
    [requestId, adminUserId, rejectionReason]
  );
  return result.rows[0] || null;
}

module.exports = {
  createRequest,
  getPendingRequests,
  getRequestsByCompany,
  getRequestById,
  approveRequest,
  rejectRequest,
};
