const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

jest.mock('../middleware/validate', () => () => (req, _res, next) => next());

jest.mock('../utils/firebaseStorage', () => ({
  findUserById: jest.fn(),
}));

// Mock Firebase db for order existence + update
const orderGet = jest.fn();
const orderUpdate = jest.fn();
const orderDoc = jest.fn(() => ({ get: orderGet, update: orderUpdate }));
const collection = jest.fn(() => ({ doc: orderDoc }));

jest.mock('../config/firebase', () => ({
  getFirebase: jest.fn(() => ({
    db: { collection },
    auth: {},
    storage: {},
    admin: {},
  })),
}));

// Mock Razorpay SDK
const ordersCreate = jest.fn();
const paymentsRefund = jest.fn();
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: { create: ordersCreate },
    payments: { refund: paymentsRefund },
  }));
});

const firebaseStorage = require('../utils/firebaseStorage');
const { createApp } = require('../app');

describe('Payment routes', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.NODE_ENV = 'test';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';

    firebaseStorage.findUserById.mockResolvedValue({
      id: 'admin_1',
      role: 'admin',
      isActive: true,
      phone: '9999999999',
      name: 'Admin',
    });
  });

  const authCookie = () => {
    const token = jwt.sign({ id: 'admin_1', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return [`niraa_token=${token}`];
  };

  test('POST /api/payments/create creates Razorpay order when Niraa order exists', async () => {
    orderGet.mockResolvedValue({ exists: true, data: () => ({}) });
    ordersCreate.mockResolvedValue({
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

    expect(ordersCreate).toHaveBeenCalled();
    expect(res.body).toMatchObject({
      razorpayOrderId: 'order_rzp_1',
      currency: 'INR',
      keyId: 'rzp_test_key',
    });
  });

  test('POST /api/payments/verify verifies signature and updates order as paid', async () => {
    orderGet.mockResolvedValue({ exists: true, data: () => ({}) });

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

    expect(orderUpdate).toHaveBeenCalled();
    expect(res.body).toMatchObject({ message: 'Payment verified successfully', razorpayPaymentId });
  });

  test('POST /api/payments/refund requires admin and calls Razorpay refund', async () => {
    paymentsRefund.mockResolvedValue({
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

    expect(paymentsRefund).toHaveBeenCalled();
    expect(res.body).toMatchObject({
      message: 'Refund initiated successfully',
      refundId: 'rfnd_1',
      status: 'processed',
      amount: 50,
    });
  });
});

