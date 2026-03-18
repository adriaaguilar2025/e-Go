const express = require('express');
const { requireAdmin } = require('../middleware/requireAdmin');
const adminStationController = require('../controllers/adminStationController');

const router = express.Router();

// Verifica el JWT admin y devuelve el payload
router.get('/me', requireAdmin, async (req, res) => {
  return res.json({ admin: req.admin });
});

// CRUD estaciones manuales
router.post('/stations', requireAdmin, adminStationController.createManualStation);
router.patch('/stations/:id', requireAdmin, adminStationController.updateManualStation);
router.delete('/stations/:id', requireAdmin, adminStationController.deleteManualStation);

module.exports = router;
