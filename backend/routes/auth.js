// Login y registro: POST /auth/google, POST /auth/register
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/google', authController.googleLogin);
router.post('/register', authController.register);

module.exports = router;
