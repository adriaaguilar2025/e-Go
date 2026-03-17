const express = require('express');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

// Verifica el JWT admin y devuelve el payload
router.get('/me', requireAdmin, async (req, res) => {
  return res.json({ admin: req.admin });
});

module.exports = router;
