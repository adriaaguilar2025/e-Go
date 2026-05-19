const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../models/userModel', () => ({
  findByIdWithBanStatus: jest.fn(),
}));

const userModel = require('../../models/userModel');
const {
  requireConductorAuth,
  requireSelfUserId,
} = require('../../middleware/requireConductorAuth');
const { conductorAuthHeader } = require('../helpers/conductorAuth');

const app = express();
app.use(express.json());
app.get('/me', requireConductorAuth, (req, res) => res.json({ authUserId: req.authUserId }));
app.get(
  '/self',
  requireConductorAuth,
  requireSelfUserId({ from: 'query', field: 'usuari_id' }),
  (req, res) => res.json({ ok: true })
);

describe('requireConductorAuth', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
    userModel.findByIdWithBanStatus.mockResolvedValue({ id: 7, is_banned: false });
  });

  test('-> 401 sin Authorization', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
  });

  test('-> 403 si usuario baneado', async () => {
    userModel.findByIdWithBanStatus.mockResolvedValue({
      id: 7,
      is_banned: true,
      banned_reason: 'spam',
    });
    const res = await request(app).get('/me').set(conductorAuthHeader(7));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('USER_BANNED');
  });

  test('-> 200 con token de conductor valido', async () => {
    const res = await request(app).get('/me').set(conductorAuthHeader(7));
    expect(res.status).toBe(200);
    expect(res.body.authUserId).toBe(7);
  });

  test('requireSelfUserId -> 403 si usuari_id no coincide', async () => {
    const res = await request(app)
      .get('/self')
      .query({ usuari_id: 99 })
      .set(conductorAuthHeader(7));
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No autorizado');
  });

  test('requireSelfUserId -> 200 si usuari_id coincide', async () => {
    const res = await request(app)
      .get('/self')
      .query({ usuari_id: 7 })
      .set(conductorAuthHeader(7));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
