const friendsService = require('../services/friendsService');


// informació del usuari
async function getFriends(req, res) {
  try {
    // Agafem els possibles paràmetres de la URL
    const { usuari_id } = req.query;

    const info = await friendsService.getFriends(usuari_id);

    res.json(info);
  } catch (err) {
    console.error('Error obteniendo amigos del usuario:', err);
    res.status(500).json({ error: 'Error obteniendo amigos del usuario' });
  }
}

async function addFriend(req, res) {
  try {
    const { usuari_id1, usuari_id2 } = req.query;

    if (!usuari_id1 || !usuari_id2) {
      return res.status(400).json({ error: 'Falta alguno de los IDs de usuario' });
    }

    const added = await friendsService.addFriend(usuari_id1, usuari_id2);
    if (!added) {
      return res.status(404).json({ error: 'Usuario/s no encontrado/s' });
    }

    res.json(added);
  } catch (err) {
    console.error('Error añadiendo amigo:', err);
    res.status(500).json({ error: 'Error añadiendo amigo' });
  }
}

module.exports = {
  getFriends,
  addFriend
};