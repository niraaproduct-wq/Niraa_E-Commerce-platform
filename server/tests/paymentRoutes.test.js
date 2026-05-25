const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

jest.mock('uuid', () => ({ v4: () => 'test-uuid-v4' }));

jest.mock('../middleware/validate', () => () => (req, _res, next) => next());

jest.mock('../utils/firebaseStorage', () => ({
  findUserById: jest.fn(),
  findAdminById: jest.fn(),
}));

// Mock Firebase db for order existence + update using globals for lazy evaluation (immune to resetMocks)
global.mockOrderGet = jest.fn();
global.mockOrderUpdate = jest.fn();

// Plain function delegate completely immune to resetMocks
global.mockCollection = (name) => ({
  doc: (id) => ({
    get: (...args) => global.mockOrderGet(...args),
    update: (...args) => global.mockOrderUpdate(...args),
  })
});

jest.mock('../config/firebase', () => ({
  getFirebase: () => ({
    db: { collection: (...args) => global.mockCollection(...args) },
    auth: {},
    storage: {},
    admin: {},
  }),
}));

// Mock Razorpay SDK using globals for lazy evaluation (immune to resetMocks)
global.mockOrdersCreate = jest.fn();
global.mockPaymentsRefund = jest.fn();
jest.mock('razorpay', () => {
  return function() {
    return {
      orders: { create: (...args) => global.mockOrdersCreate(...args) },
      payments: { refund: (...args) => global.mockPaymentsRefund(...args) },
    };
  };
});

const firebaseStorage = require('../utils/firebaseStorage');
const { createApp } = require('../app');

describe('Payment routes', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.NODE_ENV = 'test';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';

    const mockUser = {
      id: 'admin_1',
      role: 'admin',
      isActive: true,
      phone: '9999999999',
      name: 'Admin',
    };
    firebaseStorage.findUserById.mockResolvedValue(mockUser);
    firebaseStorage.findAdminById.mockResolvedValue(mockUser);
  });

  const authCookie = () => {
    const token = jwt.sign({ id: 'admin_1', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return [`niraa_token=${token}`];
  };

  test('POST /api/payments/create creates Razorpay order when Niraa order exists', async () => {
    global.mockOrderGet.mockResolvedValue({ exists: true, data: () => ({}) });
    global.mockOrdersCreate.mockResolvedValue({
      id: 'order_rzp_1',
      amount: 12300,
      currency: 'INR',
    });

    const app = createApp();
    const res = await request(app)
      .post('/api/payments/create')
      .set('Cookie', authCookie())
      .send({ amount: 123, currency: 'INR', orderId: 'niraa_order_1', description: 'Test' })
      .expect(201);

    expect(global.mockOrdersCreate).toHaveBeenCalled();
    expect(res.body).toMatchObject({
      razorpayOrderId: 'order_rzp_1',
      currency: 'INR',
      keyId: 'rzp_test_key',
    });
  });

  test('POST /api/payments/verify verifies signature and updates order as paid', async () => {
    global.mockOrderGet.mockResolvedValue({ exists: true, data: () => ({}) });

    const razorpayOrderId = 'order_rzp_1';
    const razorpayPaymentId = 'pay_rzp_1';
    const razorpaySignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const app = createApp();
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie())
      .send({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId: 'niraa_order_1' })
      .expect(200);

    expect(global.mockOrderUpdate).toHaveBeenCalled();
    expect(res.body).toMatchObject({ message: 'Payment verified successfully', razorpayPaymentId });
  });

  test('POST /api/payments/refund requires admin and calls Razorpay refund', async () => {
    global.mockPaymentsRefund.mockResolvedValue({
      id: 'rfnd_1',
      status: 'processed',
      amount: 5000,
    });

    const app = createApp();
    const res = await request(app)
      .post('/api/payments/refund')
      .set('Cookie', authCookie())
      .send({ razorpayPaymentId: 'pay_rzp_1', amount: 50, reason: 'test' })
      .expect(201);

    expect(global.mockPaymentsRefund).toHaveBeenCalled();
    expect(res.body).toMatchObject({
      message: 'Refund initiated successfully',
      refundId: 'rfnd_1',
      status: 'processed',
      amount: 50,
    });
  });
});

