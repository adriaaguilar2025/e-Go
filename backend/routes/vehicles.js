const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Guardar vehicle
router.post('/newcar', vehicleController.addCar);

module.exports = router;
