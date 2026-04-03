process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRES_IN = '1d';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('./helpers/db');
const User = require('../src/models/User');
const FinancialRecord = require('../src/models/FinancialRecord');
const { generateToken } = require('../src/utils/jwt');

let adminToken, analystToken, viewerToken, adminId;

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearAll(); });
afterAll(async () => { await db.disconnect(); });

beforeEach(async () => {
  const admin   = await User.create({ name: 'Admin',   email: 'a@t.com', password: 'pass123', role: 'admin'   });
  const analyst = await User.create({ name: 'Analyst', email: 'b@t.com', password: 'pass123', role: 'analyst' });
  const viewer  = await User.create({ name: 'Viewer',  email: 'c@t.com', password: 'pass123', role: 'viewer'  });

  adminId      = admin._id;
  adminToken   = generateToken({ id: admin._id,   role: 'admin'   });
  analystToken = generateToken({ id: analyst._id, role: 'analyst' });
  viewerToken  = generateToken({ id: viewer._id,  role: 'viewer'  });

  await FinancialRecord.create([
    { amount: 5000, type: 'income',  category: 'salary',    date: new Date(), createdBy: adminId },
    { amount: 2000, type: 'income',  category: 'freelance', date: new Date(), createdBy: adminId },
    { amount: 800,  type: 'expense', category: 'rent',      date: new Date(), createdBy: adminId },
    { amount: 200,  type: 'expense', category: 'food',      date: new Date(), createdBy: adminId },
  ]);
});

describe('Dashboard Routes', () => {
  describe('GET /api/dashboard/summary', () => {
    it('admin can access summary', async () => {
      const res = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalIncome).toBe(7000);
      expect(res.body.data.totalExpenses).toBe(1000);
      expect(res.body.data.netBalance).toBe(6000);
    });

    it('analyst can access summary', async () => {
      const res = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${analystToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('viewer can access summary', async () => {
      const res = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${viewerToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('unauthenticated request is denied', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/dashboard/categories', () => {
    it('returns income and expense breakdowns', async () => {
      const res = await request(app).get('/api/dashboard/categories').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('income');
      expect(res.body.data).toHaveProperty('expense');
      expect(res.body.data.income.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/dashboard/trends/monthly', () => {
    it('returns 12 months of data for the current year', async () => {
      const res = await request(app).get('/api/dashboard/trends/monthly').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.months.length).toBe(12);
      expect(res.body.data).toHaveProperty('year');
    });
  });

  describe('GET /api/dashboard/recent', () => {
    it('returns recent records', async () => {
      const res = await request(app).get('/api/dashboard/recent?limit=3').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/dashboard/trends/weekly', () => {
    it('returns weekly trend data', async () => {
      const res = await request(app).get('/api/dashboard/trends/weekly').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
