const vehicleService = require('../services/vehicleService');

async function addCar(req, res) {
  try {
    //Extreu la informació de la petició del frontend
    const { usuari_id, v_nom, v_potencia, v_conector, v_corrent } = req.body;
    
    //Crida al controlador
    await vehicleService.addCar(usuari_id, v_nom, v_potencia, v_conector, v_corrent);

    //Fent el criteri d'acceptació de (mostrar mensaje de confirmación efímero)
    res.status(201).json({
      success: true,
      message: 'Vehicle afegit'
    });
  } catch (err) {
    console.error('Error al afegir vehicle:', err);
    res.status(500).json({ error: 'Error al processar la solicitud' });
  }
}

/*async function removeFavorite(req, res) {
  try {
    const { usuari_id, estacio_id } = req.body;
    await favoriteService.removeFavorite(usuari_id, estacio_id);

    res.json({
      success: true,
      message: 'Estació eliminada de preferits'
    });
  } catch (err) {
    console.error('Error al eliminar favorito:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}*/

async function getVehicles(req, res) {
  try {
    const { usuari_id } = req.query; // Se puede pasar por query param
    const vehicles = await vehicleService.getUserVehicles(usuari_id);
    res.json(vehicles);
  } catch (err) {
    console.error('Error al obtener favoritos:', err);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
}

module.exports = {
  addCar,
  //removeFavorite,
  getVehicles
};
