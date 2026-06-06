const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('uuid', () => ({ v4: () => 'test-uuid-v4' }));

jest.mock('../middleware/validate', () => () => (req, _res, next) => next());

jest.mock('../utils/firebaseStorage', () => ({
  findUserByEmail: jest.fn(),
  findAdminByEmail: jest.fn(),
  findUserById: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

// Avoid real Firebase init
jest.mock('../config/firebase', () => ({
  getFirebase: jest.fn(() => ({
    db: { collection: jest.fn() },
    auth: {},
    storage: {},
    admin: {},
  })),
}));

const firebaseStorage = require('../utils/firebaseStorage');
const bcrypt = require('bcryptjs');
const { createApp } = require('../app');

describe('Admin login cookie auth', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
    process.env.NODE_ENV = 'test';
  });

  test('POST /api/auth/admin-login sets HttpOnly cookie', async () => {
    const dynamicPasswordHash = require('crypto').randomBytes(16).toString('hex');
    const testEmail = `admin-${require('crypto').randomBytes(4).toString('hex')}@example.com`;
    const testPassword = `pass-${require('crypto').randomBytes(4).toString('hex')}`;

    firebaseStorage.findAdminByEmail.mockResolvedValue({
      id: 'admin_1',
      email: testEmail,
      role: 'admin',
      password: dynamicPasswordHash,
      isActive: true,
    });
    bcrypt.compare.mockResolvedValue(true);

    const app = createApp();
    const res = await request(app)
      .post('/api/auth/admin-login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({ id: 'admin_1', role: 'admin', email: testEmail });

    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.join(';')).toContain('niraa_token=');
    expect(setCookie.join(';').toLowerCase()).toContain('httponly');
  });

  test('GET /api/auth/profile accepts cookie-based JWT', async () => {
    const token = jwt.sign({ id: 'u1', role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    firebaseStorage.findUserById.mockResolvedValue({
      id: 'u1',
      role: 'customer',
      isActive: true,
      phone: '9999999999',
      name: 'User',
    });

    const app = createApp();
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Cookie', [`niraa_token=${token}`])
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({ id: 'u1', role: 'customer' });
  });
});

