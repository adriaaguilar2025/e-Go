const axios = require('axios');
const friendsModel = require('../models/friendsModel');


async function getFriends(userId) {
  const info = await friendsModel.getFriends(userId);
  return info;
}

async function addFriend(userId1, userId2) {
  const added = await friendsModel.addFriend(userId1, userId2);
  return added;
}

module.exports = { getFriends, addFriend };