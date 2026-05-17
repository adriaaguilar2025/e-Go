const { pool } = require('../../lib/db');
const userModel = require('../../models/userModel');

jest.mock('../../lib/db', () => ({
  pool: { query: jest.fn() },
  USUARIOS_TABLE: '"ego"."usuari"',
  CONDUCTORES_TABLE: '"ego"."conductor"',
  SUBSCRIPTIONS_TABLE: '"ego"."subscription"',
  ADMINS_TABLE: '"ego"."admins"',
  EMPRESAS_TABLE: '"ego"."empresas"',
}));

describe('userModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    test('findByEmail devuelve usuario cuando existe', async () => {
      const mockUser = { id: 1, email: 'test@test.com', username: 'test' };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.findByEmail('test@test.com');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['test@test.com']);
    });

    test('findByEmail devuelve null cuando no existe usuario', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findByEmail('noexiste@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findConductorByEmail', () => {
    test('findConductorByEmail devuelve usuario cuando existe en usuari y conductor', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 2, email: 'pau@test.com', username: 'pau' }],
      });

      const result = await userModel.findConductorByEmail('pau@test.com');

      expect(result).toEqual({ id: 2, email: 'pau@test.com', username: 'pau' });
      expect(pool.query).toHaveBeenCalledTimes(1);
      const [query, values] = pool.query.mock.calls[0];
      expect(query).toContain('JOIN "ego"."conductor" c ON c.user_id = u.id');
      expect(query).toContain('WHERE u.email = $1');
      expect(values).toEqual(['pau@test.com']);
    });

    test('findConductorByEmail devuelve null cuando no existe fila de conductor', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findConductorByEmail('missing@test.com');

      expect(result).toBeNull();
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByEmailWithPassword', () => {
    test('findByEmailWithPassword devuelve usuario con password_hash', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@test.com',
            username: 'test',
            password_hash: 'hash123',
          },
        ],
      });

      const result = await userModel.findByEmailWithPassword('test@test.com');

      expect(result).toEqual({
        id: 1,
        email: 'test@test.com',
        username: 'test',
        password_hash: 'hash123',
      });
    });

    test('findByEmailWithPassword devuelve null cuando no existe usuario', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findByEmailWithPassword('noexiste@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findConductorByEmailWithPassword', () => {
    test('findConductorByEmailWithPassword devuelve password_hash cuando existe conductor', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 3,
            email: 'driver@test.com',
            username: 'driver',
            password_hash: 'hash123',
          },
        ],
      });

      const result = await userModel.findConductorByEmailWithPassword('driver@test.com');

      expect(result).toEqual(
        expect.objectContaining({
          id: 3,
          email: 'driver@test.com',
          username: 'driver',
          password_hash: 'hash123',
        })
      );
      const [query] = pool.query.mock.calls[0];
      expect(query).toContain('JOIN "ego"."conductor" c ON c.user_id = u.id');
    });

    test('findConductorByEmailWithPassword devuelve null cuando no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findConductorByEmailWithPassword('noexiste@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findAdminByEmailWithPassword', () => {
    test('findAdminByEmailWithPassword devuelve admin con password_hash', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            user_id: 1,
            email: 'admin@test.com',
            username: 'admin',
            password_hash: 'adminhash',
            admin_since: '2024-01-01',
          },
        ],
      });

      const result = await userModel.findAdminByEmailWithPassword('admin@test.com');

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email: 'admin@test.com',
          username: 'admin',
          password_hash: 'adminhash',
        })
      );
      const [query] = pool.query.mock.calls[0];
      expect(query).toContain('INNER JOIN');
      expect(query).toContain('admins');
    });

    test('findAdminByEmailWithPassword devuelve null cuando no es admin', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findAdminByEmailWithPassword('user@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findCompanyByEmailWithPassword', () => {
    test('findCompanyByEmailWithPassword devuelve company con password_hash', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 5,
            user_id: 5,
            email: 'company@test.com',
            username: 'company',
            password_hash: 'companyhash',
            nombre: 'Mi Empresa',
            company_since: '2024-01-01',
          },
        ],
      });

      const result = await userModel.findCompanyByEmailWithPassword('company@test.com');

      expect(result).toEqual(
        expect.objectContaining({
          id: 5,
          email: 'company@test.com',
          username: 'company',
          password_hash: 'companyhash',
          nombre: 'Mi Empresa',
        })
      );
      const [query] = pool.query.mock.calls[0];
      expect(query).toContain('INNER JOIN');
      expect(query).toContain('empresas');
    });

    test('findCompanyByEmailWithPassword devuelve null cuando no es empresa', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findCompanyByEmailWithPassword('user@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    test('findById devuelve usuario cuando existe', async () => {
      const mockUser = { id: 1, email: 'test@test.com', username: 'test' };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.findById(1);

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    test('findById devuelve null cuando no existe usuario', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('getInfoUser', () => {
    test('getInfoUser devuelve información completa del usuario', async () => {
      const mockInfo = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        punts: 100,
        created_at: '2024-01-01',
        premium: true,
        admin: false,
        empresa: false,
      };
      pool.query.mockResolvedValueOnce({ rows: [mockInfo] });

      const result = await userModel.getInfoUser(1);

      expect(result).toEqual(mockInfo);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    test('getInfoUser devuelve undefined cuando usuario no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.getInfoUser(999);

      expect(result).toBeUndefined();
    });
  });

  describe('updateUser', () => {
    test('updateUser actualiza el username del usuario', async () => {
      const mockUpdated = {
        id: 1,
        email: 'test@test.com',
        username: 'nuevo_username',
        created_at: '2024-01-01',
        updated_at: '2024-01-15',
      };
      pool.query.mockResolvedValueOnce({ rows: [mockUpdated] });

      const result = await userModel.updateUser(1, 'nuevo_username');

      expect(result).toEqual(mockUpdated);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1, 'nuevo_username']);
    });

    test('updateUser lanza error cuando falta username', async () => {
      await expect(userModel.updateUser(1, '')).rejects.toThrow('Falta el campo username');
    });

    test('updateUser devuelve null cuando usuario no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.updateUser(999, 'nuevo');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    test('createUser crea un nuevo usuario', async () => {
      const mockUser = {
        id: 10,
        email: 'nuevo@test.com',
        username: 'nuevo',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.createUser('nuevo@test.com', 'nuevo');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
        'nuevo@test.com',
        'nuevo',
      ]);
    });

    test('createUser retorna el usuario creado con todos los campos', async () => {
      const mockUser = {
        id: 15,
        email: 'test@example.com',
        username: 'testuser',
        created_at: '2024-01-20',
        updated_at: '2024-01-20',
      };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.createUser('test@example.com', 'testuser');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('created_at');
    });
  });

  describe('createLocalUser', () => {
    test('createLocalUser crea usuario con password_hash', async () => {
      const mockUser = {
        id: 11,
        email: 'local@test.com',
        username: 'local',
        created_at: '2024-01-16',
        updated_at: '2024-01-16',
      };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.createLocalUser('local@test.com', 'local', 'hash123');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
        'local@test.com',
        'local',
        'hash123',
      ]);
    });
  });

  describe('setPasswordHashByUserId', () => {
    test('setPasswordHashByUserId actualiza el password_hash', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        username: 'test',
        created_at: '2024-01-01',
        updated_at: '2024-01-20',
      };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.setPasswordHashByUserId(1, 'newhash123');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1, 'newhash123']);
    });

    test('setPasswordHashByUserId devuelve null cuando usuario no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.setPasswordHashByUserId(999, 'hash');

      expect(result).toBeNull();
    });
  });

  describe('ensureConductorForUser', () => {
    test('ensureConductorForUser inserta conductor para usuario', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await userModel.ensureConductorForUser(1);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
      const [query] = pool.query.mock.calls[0];
      expect(query).toContain('INSERT INTO');
      expect(query).toContain('ON CONFLICT');
    });
  });

  describe('backfillConductoresFromUsuarios', () => {
    test('backfillConductoresFromUsuarios crea conductores faltantes', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 5 });

      const result = await userModel.backfillConductoresFromUsuarios();

      expect(result).toBe(5);
      expect(pool.query).toHaveBeenCalledTimes(1);
      const [query] = pool.query.mock.calls[0];
      expect(query).toContain('INSERT INTO');
      expect(query).toContain('SELECT');
      expect(query).toContain('LEFT JOIN');
    });

    test('backfillConductoresFromUsuarios retorna 0 cuando no hay usuarios faltantes', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await userModel.backfillConductoresFromUsuarios();

      expect(result).toBe(0);
    });
  });
});
