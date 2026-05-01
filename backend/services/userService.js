const axios = require('axios');
const userModel = require('../models/userModel');


async function getUser(userId) {
  const info = await userModel.getInfoUser(userId);
  return info;
}

module.exports = { getUser };