const path = require('path');
// Cargamos variables de entorno (Prioriza las de AWS Lambda)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

// --- IMPORTACIÓN DE RUTAS ---
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const { pool } = require('./lib/db');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- RUTAS ---

// 1. Root / Health Check
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now');
    res.json({
      status: 'online',
      mensaje: 'e-Go API v1.0 - AWS Lambda',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: 'error', details: 'DB Connection failed' });
  }
});

// 2. Registro de Módulos
app.use('/auth', authRoutes);
app.use('/stations', stationRoutes);

// 3. Manejador 404
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `La ruta ${req.path} no existe en esta API.`
  });
});

// --- EXPORT PARA AWS LAMBDA ---
module.exports.handler = serverless(app);

// En local, arrancar servidor y sincronizar estaciones (en Lambda no se ejecuta)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = process.env.PORT || 3000;
  const { startScheduler } = require('./lib/scheduler');
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
    startScheduler(5 * 60 * 1000); // sync al arrancar y cada 5 min (necesita APP_TOKEN en .env para la API Generalitat)
  });
}
