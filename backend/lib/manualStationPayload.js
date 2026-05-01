function parseNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return num;
}

function isValidLatitude(value) {
  return value !== null && value >= -90 && value <= 90;
}

function isValidLongitude(value) {
  return value !== null && value >= -180 && value <= 180;
}

function validateCreateStationInput(body = {}) {
  const {
    external_id,
    promotor,
    acces,
    tipus_velocitat,
    tipus_connexio,
    latitud,
    longitud,
    nom,
    kw,
    ac_dc,
    adreca,
    municipi,
    provincia,
  } = body;

  const lat = parseNumber(latitud);
  const lng = parseNumber(longitud);
  const power = parseNumber(kw) ?? 0;

  if (!nom || typeof nom !== 'string') {
    return { error: 'Falta el nombre de la estacion' };
  }
  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    return { error: 'Latitud debe estar entre -90 y 90 y longitud entre -180 y 180' };
  }

  return {
    value: {
      external_id,
      promotor,
      acces,
      tipus_velocitat,
      tipus_connexio,
      latitud: lat,
      longitud: lng,
      nom: nom.trim(),
      kw: power,
      ac_dc,
      adreca,
      municipi,
      provincia,
    },
  };
}

function validateUpdateStationPatch(body = {}) {
  const patch = {};

  if (body.external_id !== undefined) patch.external_id = body.external_id || null;
  if (body.promotor !== undefined) patch.promotor = body.promotor || null;
  if (body.acces !== undefined) patch.acces = body.acces || null;
  if (body.tipus_velocitat !== undefined) patch.tipus_velocitat = body.tipus_velocitat || null;
  if (body.tipus_connexio !== undefined) patch.tipus_connexio = body.tipus_connexio || null;
  if (body.nom !== undefined) patch.nom = body.nom ? body.nom.trim() : null;
  if (body.ac_dc !== undefined) patch.ac_dc = body.ac_dc || null;
  if (body.adreca !== undefined) patch.adreca = body.adreca || null;
  if (body.municipi !== undefined) patch.municipi = body.municipi || null;
  if (body.provincia !== undefined) patch.provincia = body.provincia || null;

  if (body.latitud !== undefined) {
    const lat = parseNumber(body.latitud);
    if (!isValidLatitude(lat)) {
      return { error: 'Latitud invalida: debe estar entre -90 y 90' };
    }
    patch.latitud = lat;
  }

  if (body.longitud !== undefined) {
    const lng = parseNumber(body.longitud);
    if (!isValidLongitude(lng)) {
      return { error: 'Longitud invalida: debe estar entre -180 y 180' };
    }
    patch.longitud = lng;
  }

  if (body.kw !== undefined) {
    const power = parseNumber(body.kw);
    if (power === null) {
      return { error: 'kw invalido' };
    }
    patch.kw = power;
  }

  return { value: patch };
}

module.exports = {
  validateCreateStationInput,
  validateUpdateStationPatch,
};
