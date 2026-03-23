const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Guardar vehicle
router.post('/', vehicleController.addCar);

//Obtener lista de favoritos de un usuario
router.get('/', vehicleController.getVehicles);

module.exports = router;
