const express = require('express');
const { requireCompany } = require('../middleware/requireCompany');
const companyStationController = require('../controllers/companyStationController');
const { pool, USUARIOS_TABLE, EMPRESAS_TABLE } = require('../lib/db');

const router = express.Router();

router.get('/me', requireCompany, async (req, res) => {
  return res.json({ company: req.company });
});

router.get('/user', requireCompany, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.user_id, e.nombre, e.created_at, u.email, u.username
       FROM ${EMPRESAS_TABLE} e
       JOIN ${USUARIOS_TABLE} u ON u.id = e.user_id
       WHERE e.id = $1`,
      [req.company.sub]
    );
    const company = result.rows[0];
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
    return res.json({ company });
  } catch (err) {
    console.error('Error en /company/user:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/stations/mine', requireCompany, companyStationController.listMyStations);
router.get('/station-requests/mine', requireCompany, companyStationController.listMyRequests);
router.post('/stations', requireCompany, companyStationController.requestCreateStation);
router.patch('/stations/:id', requireCompany, companyStationController.requestUpdateStation);
router.delete('/stations/:id', requireCompany, companyStationController.requestDeleteStation);

module.exports = router;
