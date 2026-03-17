// Testing de la ruta de estaciones (Charging Points)
// Probamos que la API responde correctamente al pedir puntos visibles en el mapa.

const request = require('supertest');
const express = require('express');
const { pool } = require('../../lib/db');
const stationRouter = require('../../routes/stations');

const app = express();
app.use(express.json());
app.use('/stations', stationRouter);

describe('GET /stations', () => {
  beforeEach(() => {
    // Mock de pool.query para evitar llamadas reales a la base de datos
    pool.query = jest.fn();
    jest.clearAllMocks();
  });

  test('se retorna una lista de estaciones en formato array', async () => {
    // Simulamos que la base de datos devuelve 2 estaciones
    pool.query.mockResolvedValue({
      rows: [
        { id: 1, nom: 'Estación A', latitud: '41.38', longitud: '2.16' },
        { id: 2, nom: 'Estación B', latitud: '41.39', longitud: '2.17' }
      ],
    });

    const res = await request(app).get('/stations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('latitud');
  });

  test('se procesan los filtros correctamente (north, south, east, west)', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    // Hacemos una petición simulando que el mapa está en una zona concreta
    const res = await request(app)
      .get('/stations')
      .query({ north: 41.5, south: 41.3, east: 2.2, west: 2.0 });

    expect(res.status).toBe(200);
    // Verificamos que la query a la base de datos fue llamada (indicando que el controlador pasó los filtros)
    expect(pool.query).toHaveBeenCalled();
  });

  test('devuelve 500 si la BD falla', async () => {
    pool.query.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/stations');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
