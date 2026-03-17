// Login y registro con Google: POST /auth/google, POST /auth/register
const express = require('express');
const jwt = require('jsonwebtoken');
const { pool, USUARIOS_TABLE, ADMINS_TABLE } = require('../lib/db');
const {
  getGooglePayload,
  createPendingToken,
  verifyPendingToken,
} = require('../lib/authHelpers');

const router = express.Router();

// Login: frontend manda code+redirectUri+code_verifier (o idToken); comprobamos con Google
router.post('/google', async (req, res) => {
  try {
    const hasIdToken = !!req.body.idToken;
    const hasCode = !!(req.body.code && req.body.redirectUri);
    if (!hasIdToken && !hasCode) {
      return res.status(400).json({ error: 'Envía idToken o code + redirectUri' });
    }

    const payload = await getGooglePayload(req.body);
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Token de Google no válido. Envía idToken o code + redirectUri.' });
    }
    const email = payload.email;

    const result = await pool.query(
      `SELECT id, email, username, created_at, updated_at FROM ${USUARIOS_TABLE} WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (user) {
      return res.json({ user, needsUsername: false });
    }
    // Usuario nuevo: token temporal para que elija username en el siguiente paso
    const pending_token = createPendingToken(email);
    return res.json({ needsUsername: true, email, pending_token });
  } catch (err) {
    console.error('Error en /auth/google:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Registro: pending_token + username (o code+redirectUri+code_verifier+username)
router.post('/register', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Falta username' });
    }
    const name = username.trim();
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener entre 2 y 100 caracteres' });
    }

    let email;
    if (req.body.pending_token) {
      const pending = verifyPendingToken(req.body.pending_token);
      if (!pending) {
        return res.status(401).json({ error: 'Token de registro expirado o no válido. Vuelve a iniciar sesión con Google.' });
      }
      email = pending.email;
    } else {
      const payload = await getGooglePayload(req.body);
      if (!payload || !payload.email) {
        return res.status(401).json({ error: 'Token de Google no válido. Envía pending_token o code + redirectUri + code_verifier.' });
      }
      email = payload.email;
    }

    const result = await pool.query(
      `INSERT INTO ${USUARIOS_TABLE} (email, username) VALUES ($1, $2)
       RETURNING id, email, username, created_at, updated_at`,
      [email, name]
    );
    const user = result.rows[0];
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === '23505') {
      const msg = err.constraint?.includes('email') ? 'Este email ya está registrado' : 'Ese nombre de usuario ya existe';
      return res.status(409).json({ error: msg });
    }
    console.error('Error en /auth/register:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Admin login: solo permite emails con fila en admins. Devuelve JWT para backoffice.
router.post('/admin/google', async (req, res) => {
  try {
    const hasIdToken = !!req.body.idToken;
    const hasCode = !!(req.body.code && req.body.redirectUri);
    if (!hasIdToken && !hasCode) {
      return res.status(400).json({ error: 'Envia idToken o code + redirectUri' });
    }

    const payload = await getGooglePayload(req.body);
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Token de Google no valido. Envia idToken o code + redirectUri.' });
    }
    const email = payload.email;

    const adminResult = await pool.query(
      `SELECT u.id, u.email, u.username, a.created_at AS admin_since
       FROM ${ADMINS_TABLE} a
       JOIN ${USUARIOS_TABLE} u ON u.id = a.user_id
       WHERE u.email = $1`,
      [email]
    );
    const admin = adminResult.rows[0];
    if (!admin) {
      return res.status(403).json({ error: 'No eres admin' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET no configurado' });
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: 'admin' },
      secret,
      { expiresIn }
    );

    return res.json({ admin, token, expiresIn });
  } catch (err) {
    console.error('Error en /auth/admin/google:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
