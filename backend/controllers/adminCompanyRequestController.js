const stationRequestModel = require('../models/stationRequestModel');

async function listPendingRequests(req, res) {
  try {
    const requests = await stationRequestModel.getPendingRequests();
    return res.json(requests);
  } catch (err) {
    console.error('Error listando solicitudes pendientes:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function approveRequest(req, res) {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const result = await stationRequestModel.approveRequest({
      requestId,
      adminUserId: req.admin.sub,
    });

    if (!result) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    return res.json(result);
  } catch (err) {
    if (err.code === 'REQUEST_ALREADY_RESOLVED') {
      return res.status(409).json({ error: err.message });
    }
    if (err.code === 'STATION_NOT_FOUND') {
      return res.status(404).json({ error: err.message });
    }
    console.error('Error aprobando solicitud:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function rejectRequest(req, res) {
  try {
    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const rejectionReason = req.body?.rejection_reason || null;
    const request = await stationRequestModel.rejectRequest({
      requestId,
      adminUserId: req.admin.sub,
      rejectionReason,
    });

    if (!request) {
      return res.status(404).json({ error: 'Solicitud pendiente no encontrada' });
    }
    return res.json(request);
  } catch (err) {
    console.error('Error rechazando solicitud:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = {
  listPendingRequests,
  approveRequest,
  rejectRequest,
};
