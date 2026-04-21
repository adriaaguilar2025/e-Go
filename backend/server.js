const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {canReach} = require('./services/rangeCalculationService');

const app = express();
app.use(cors());
app.use(express.json());

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    const appApiKey = process.env.MY_API_KEY_SECRET;
    if (!apiKey || apiKey !== appApiKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next(); //pasamos a la siguiente funcion
}

app.use(apiKeyMiddleware);

app.get('/can-reach', async (req, res) => {
    try {
        const { startLat, startLon, endLat, endLon, vehicleType, batteryKWh } = req.query;
        const data = {
            start: { lat: Number(startLat), lon: Number(startLon) },
            end: { lat: Number(endLat), lon: Number(endLon) },
            vehicleType: String(vehicleType).toLowerCase(),
            batteryKWh: Number(batteryKWh),
        }
        const result = await canReach(data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});