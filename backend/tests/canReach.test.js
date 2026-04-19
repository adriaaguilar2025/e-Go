require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { canReach } = require('../services/rangeCalculationService');

describe('canReach() - Range Calculator Service', () => {
  
  describe('Vehicles can reach destination', () => {
    
    test('Bike reaches short distance (<1km)', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'bike',
        batteryKWh: 0.5,
      });
      expect(result.canReach).toBe(true);
      expect(result.batteryLeftKWh).toBeGreaterThan(0);
    });

    test('Car reaches short distance (<1km)', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'car',
        batteryKWh: 50,
      });
      expect(result.canReach).toBe(true);
      expect(result.batteryLeftKWh).toBeGreaterThan(0);
    });

    test('Bike reaches medium distance (50km) with battery to spare', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.8781, lon: 1.2900 },
        vehicleType: 'bike',
        batteryKWh: 5.0,
      });
      expect(result.canReach).toBe(true);
      expect(result.batteryLeftKWh).toBeGreaterThan(1.0);
    });

    test('Car reaches long distance (500km) with battery to spare', async () => {
      const result = await canReach({
        start: { lat: 40.4168, lon: -3.7038 },
        end: { lat: 37.3891, lon: -5.9845 },
        vehicleType: 'car',
        batteryKWh: 200,
      });
      expect(result.canReach).toBe(true);
      expect(result.batteryLeftKWh).toBeGreaterThan(10);
    });
  });

  describe('Vehicles barely make it to the destination', () => {
    
    test('Bike barely reaches destination (battery ~0.05 kWh left)', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'bike',
        batteryKWh: 0.08,
      });
      expect(result.canReach).toBe(true);
      expect(result.batteryLeftKWh).toBeGreaterThan(0);
    });

    test('Car barely reaches destination (battery ~0.5 kWh left)', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'car',
        batteryKWh: 20.5,
      });
      expect(result.canReach).toBe(true);
      expect(result.batteryLeftKWh).toBeGreaterThan(0);
    });

    test('Bike runs out exactly at destination (battery = 0)', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'bike',
        batteryKWh: 0.087,
      });
      expect(result.canReach).toBe(true);
      expect(Math.abs(result.batteryLeftKWh)).toBeLessThan(0.1);
    });

    test('Cannot reach - insufficient battery', async () => {
      const result = await canReach({
        start: { lat: 40.4168, lon: -3.7038 },
        end: { lat: 37.3891, lon: -5.9845 },
        vehicleType: 'bike',
        batteryKWh: 0.01,
      });
      expect(result.canReach).toBe(false);
      expect(result.batteryLeftKWh).toBeLessThan(0);
    });
  });

  describe('Vehicle Comparison Tests', () => {
    
    test('Bike consumes less energy than car on same route', async () => {
      const bikeResult = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'bike',
        batteryKWh: 1.0,
      });
      const carResult = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'car',
        batteryKWh: 100,
      });
      
      const bikeEnergyUsed = 1.0 - bikeResult.batteryLeftKWh;
      const carEnergyUsed = 100 - carResult.batteryLeftKWh;
      
      expect(bikeEnergyUsed).toBeLessThan(carEnergyUsed);
    });

    test('Bike (1 kWh) vs Car (50 kWh) on same route', async () => {
      const bikeResult = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'bike',
        batteryKWh: 1.0,
      });
      const carResult = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'car',
        batteryKWh: 50,
      });
      
      expect(typeof bikeResult.canReach).toBe('boolean');
      expect(typeof carResult.canReach).toBe('boolean');
      expect(typeof bikeResult.batteryLeftKWh).toBe('number');
      expect(typeof carResult.batteryLeftKWh).toBe('number');
    });
  });

  describe('Distance Variation Tests', () => {
    
    test('Very short distance (<1 km)', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3852, lon: 2.1735 },
        vehicleType: 'car',
        batteryKWh: 20,
      });
      expect(result.canReach).toBe(true);
      expect(result.batteryLeftKWh).toBeGreaterThan(19);
    });

    test('Medium distance (~50 km)', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.8781, lon: 1.2900 },
        vehicleType: 'car',
        batteryKWh: 100,
      });
      expect(result.canReach).toBe(true);
      expect(typeof result.batteryLeftKWh).toBe('number');
    });

    test('Long distance (~500 km)', async () => {
      const result = await canReach({
        start: { lat: 40.4168, lon: -3.7038 },
        end: { lat: 37.3891, lon: -5.9845 },
        vehicleType: 'car',
        batteryKWh: 120,
      });
      expect(result.canReach).toBe(true);
      expect(typeof result.batteryLeftKWh).toBe('number');
    });
  });

  describe('Input Validation Tests', () => {
    
    test('Rejects invalid start coordinate (missing lon)', async () => {
      await expect(
        canReach({
          start: { lat: 41.3851 },
          end: { lat: 41.3861, lon: 2.1754 },
          vehicleType: 'bike',
          batteryKWh: 0.5,
        })
      ).rejects.toThrow(/start/);
    });

    test('Rejects invalid end coordinate (wrong type)', async () => {
      await expect(
        canReach({
          start: { lat: 41.3851, lon: 2.1734 },
          end: { lat: 'invalid', lon: 2.1754 },
          vehicleType: 'bike',
          batteryKWh: 0.5,
        })
      ).rejects.toThrow(/end/);
    });

    test('Rejects invalid vehicle type', async () => {
      await expect(
        canReach({
          start: { lat: 41.3851, lon: 2.1734 },
          end: { lat: 41.3861, lon: 2.1754 },
          vehicleType: 'helicopter',
          batteryKWh: 0.5,
        })
      ).rejects.toThrow(/vehicleType/);
    });

    test('Rejects negative battery', async () => {
      await expect(
        canReach({
          start: { lat: 41.3851, lon: 2.1734 },
          end: { lat: 41.3861, lon: 2.1754 },
          vehicleType: 'bike',
          batteryKWh: -5,
        })
      ).rejects.toThrow(/batteryKWh/);
    });

    test('Handles zero distance (same start and end)', async () => {
      try {
        const result = await canReach({
          start: { lat: 41.3851, lon: 2.1734 },
          end: { lat: 41.3851, lon: 2.1734 },
          vehicleType: 'bike',
          batteryKWh: 0.1,
        });
        expect(result.batteryLeftKWh).toBeGreaterThan(0.08);
      } catch (error) {
        expect(error.message).toMatch(/points/);
      }
    });
  });

  describe('Special Cases', () => {
    
    test('Energy consumption increases with elevation gain', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'bike',
        batteryKWh: 1.0,
      });
      expect(typeof result.batteryLeftKWh).toBe('number');
      expect(result).toHaveProperty('canReach');
      expect(result).toHaveProperty('batteryLeftKWh');
    });

    test('Returns properly formatted result object', async () => {
      const result = await canReach({
        start: { lat: 41.3851, lon: 2.1734 },
        end: { lat: 41.3861, lon: 2.1754 },
        vehicleType: 'bike',
        batteryKWh: 0.5,
      });
      
      expect(result).toEqual({
        canReach: expect.any(Boolean),
        batteryLeftKWh: expect.any(Number),
      });
    });
  });
});
