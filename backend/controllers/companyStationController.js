const stationModel = require('../models/stationModel');
const stationRequestModel = require('../models/stationRequestModel');
const {
  validateCreateStationInput,
  validateUpdateStationPatch,
} = require('../lib/manualStationPayload');

async function listMyStations(req, res) {
  try {
    const stations = await stationModel.getManualStationsByCompany(req.company.sub);
    return res.json(stations);
  } catch (err) {
    console.error('Error listando estaciones de empresa:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function listMyRequests(req, res) {
  try {
    const requests = await stationRequestModel.getRequestsByCompany(req.company.sub);
    return res.json(requests);
  } catch (err) {
    console.error('Error listando solicitudes de empresa:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function requestCreateStation(req, res) {
  try {
    const parsed = validateCreateStationInput(req.body || {});
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const request = await stationRequestModel.createRequest({
      empresaId: req.company.sub,
      action: 'create',
      payload: parsed.value,
    });
    return res.status(201).json(request);
  } catch (err) {
    console.error('Error creando solicitud de alta de estacion:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function requestUpdateStation(req, res) {
  try {
    const stationId = Number(req.params.id);
    if (!Number.isInteger(stationId)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const station = await stationModel.getCompanyOwnedManualStationById(stationId, req.company.sub);
    if (!station) {
      return res.status(404).json({ error: 'Estacion no encontrada o no pertenece a la empresa' });
    }

    const parsed = validateUpdateStationPatch(req.body || {});
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }
    if (Object.keys(parsed.value).length === 0) {
      return res.status(400).json({ error: 'No hay cambios para solicitar' });
    }

    const request = await stationRequestModel.createRequest({
      empresaId: req.company.sub,
      stationId,
      action: 'update',
      payload: parsed.value,
    });
    return res.status(201).json(request);
  } catch (err) {
    console.error('Error creando solicitud de modificacion de estacion:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function requestDeleteStation(req, res) {
  try {
    const stationId = Number(req.params.id);
    if (!Number.isInteger(stationId)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const station = await stationModel.getCompanyOwnedManualStationById(stationId, req.company.sub);
    if (!station) {
      return res.status(404).json({ error: 'Estacion no encontrada o no pertenece a la empresa' });
    }

    const request = await stationRequestModel.createRequest({
      empresaId: req.company.sub,
      stationId,
      action: 'delete',
      payload: {},
    });
    return res.status(201).json(request);
  } catch (err) {
    console.error('Error creando solicitud de borrado de estacion:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = {
  listMyStations,
  listMyRequests,
  requestCreateStation,
  requestUpdateStation,
  requestDeleteStation,
};
