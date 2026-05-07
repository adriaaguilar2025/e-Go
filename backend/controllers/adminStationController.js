const stationModel = require('../models/stationModel');
const {
  validateCreateStationInput,
  validateUpdateStationPatch,
} = require('../lib/manualStationPayload');

async function createManualStation(req, res) {
  try {
    const parsed = validateCreateStationInput(req.body || {});
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const station = await stationModel.createManualStation({
      ...parsed.value,
      created_by_admin_id: req.admin.sub,
    });

    return res.status(201).json(station);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'external_id ya existe' });
    }
    console.error('Error creando estacion manual:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function updateManualStation(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const parsed = validateUpdateStationPatch(req.body || {});
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const station = await stationModel.updateManualStation(id, parsed.value);
    if (!station) {
      return res.status(404).json({ error: 'Estacion manual no encontrada' });
    }
    return res.json(station);
  } catch (err) {
    console.error('Error actualizando estacion manual:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function deleteManualStation(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    const deleted = await stationModel.deleteManualStation(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Estacion manual no encontrada' });
    }
    return res.json({ success: true, id: deleted.id });
  } catch (err) {
    console.error('Error borrando estacion manual:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = {
  createManualStation,
  updateManualStation,
  deleteManualStation,
  listMyManualStations,
};

async function listMyManualStations(req, res) {
  try {
    const stations = await stationModel.getManualStationsByAdmin(req.admin.sub);
    return res.json(stations);
  } catch (err) {
    console.error('Error listando estaciones manuales:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
