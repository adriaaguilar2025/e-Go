const { pool } = require('../lib/db');

//Añadir unvehiculo de un usuario en la BD (tabla vehicles)
async function addCar(usuariId, nom, potencia, conector, corrent) {
 //Comentarios: 1) //Son placeholders (marcadores de posición), $1 recibirá el primer valor del array con el que
                    //se llama a la funcion pool.query (usuariId) y $2 el segundo (estacioId).
              //2)  RETURNING *;  Esto hace que retorne la fila insertada (un insert por defecto no lo hace)
  const query = `
    INSERT INTO ego.vehicles (usuari_id, nom, kw, ac_dc, tipus_connexio)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (usuari_id, nom) DO NOTHING
    RETURNING *;
  `;
  const result = await pool.query(query, [usuariId, nom, potencia, corrent, conector]);
  return result.rows[0];//Solo devolvemos una fila
}

//Eliminar una estacion de carga a favoritos de un usuario en la BD (tabla favorits)
/*async function removeFavorite(usuariId, estacioId) {
  const query = `
    DELETE FROM ego.favorits
    WHERE usuari_id = $1 AND estacio_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [usuariId, estacioId]);
  return result.rows[0];//Solo devolvemos una fila
}*/

async function getVehiclesByUser(usuariId) {
  // Esta consulta une favoritos con estaciones para devolver la info completa
  const query = `
    SELECT *
    FROM ego.vehicles
    WHERE usuari_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [usuariId]);
  return result.rows;
}

//Funciones que queremos que se puedan llamar desde el exterior
module.exports = {
  addCar,
  //removeFavorite,
  getVehiclesByUser
};
