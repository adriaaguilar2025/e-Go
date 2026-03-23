const vehicleModel = require('../models/vehicleModel');

async function addCar(usuariId, nom, potencia, conector, corrent) {
    //Si no ens donen els parametres llençem exepció, si no cridem al model per l'Insert
  if ((!usuariId) || (!nom) || (!potencia) || (!conector) || (!corrent)) throw new Error('Faltan parametres');
  add = await vehicleModel.addCar(usuariId, nom, potencia, conector, corrent);
  if(add == null) throw new Error('El vehicle ja existia');
  return add;
}

/*async function removeFavorite(usuariId, estacioId) {
    //Si no ens donen els parametres llençem exepció, si no cridem al model per el Delete
  if (!usuariId || !estacioId) throw new Error('Faltan IDs de usuario o estación');
  return await favoriteModel.removeFavorite(usuariId, estacioId);
}*/

async function getUserVehicles(usuariId) {
    //Si no ens donen els parametres llençem exepció, si no cridem al model per el Select
  if (!usuariId) throw new Error('ID de usuario no proporcionado');
  return await vehicleModel.getVehiclesByUser(usuariId);
}

module.exports = {
  addCar,
  //removeFavorite,
  getUserVehicles
};
