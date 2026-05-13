const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');

// Informació del usuari
router.get('/', friendsController.getFriends);
router.put('/', friendsController.addFriend);

module.exports = router;
