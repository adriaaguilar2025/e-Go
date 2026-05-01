const userService = require('../services/userService');


// informació del usuari
async function getUser(req, res) {
  try {
    // Agafem els possibles paràmetres de la URL
    const { usuari_id } = req.query;

    const info = await userService.getUser(usuari_id);

    res.json(info);
  } catch (err) {
    console.error('Error obteniendo información del usuario:', err);
    res.status(500).json({ error: 'Error obteniendo información del usuario' });
  }
}

module.exports = {
  getUser
};