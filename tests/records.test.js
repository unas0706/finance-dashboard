process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRES_IN = '1d';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('./helpers/db');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/jwt');

let adminToken, analystToken, viewerToken, adminId;

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearAll(); });
afterAll(async () => { await db.disconnect(); });

beforeEach(async () => {
  const admin   = await User.create({ name: 'Admin',   email: 'admin@t.com',   password: 'pass123', role: 'admin'   });
  const analyst = await User.create({ name: 'Analyst', email: 'analyst@t.com', password: 'pass123', role: 'analyst' });
  const viewer  = await User.create({ name: 'Viewer',  email: 'viewer@t.com',  password: 'pass123', role: 'viewer'  });

  adminId      = admin._id.toString();
  adminToken   = generateToken({ id: admin._id,   role: 'admin'   });
  analystToken = generateToken({ id: analyst._id, role: 'analyst' });
  viewerToken  = generateToken({ id: viewer._id,  role: 'viewer'  });
});

const validRecord = { amount: 1500, type: 'income', category: 'salary', date: '2024-06-01' };

describe('Financial Records', () => {
  describe('POST /api/records', () => {
    it('admin can create a record', async () => {
      const res = await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(validRecord);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.amount).toBe(1500);
    });

    it('analyst cannot create a record', async () => {
      const res = await request(app).post('/api/records').set('Authorization', `Bearer ${analystToken}`).send(validRecord);
      expect(res.statusCode).toBe(403);
    });

    it('viewer cannot create a record', async () => {
      const res = await request(app).post('/api/records').set('Authorization', `Bearer ${viewerToken}`).send(validRecord);
      expect(res.statusCode).toBe(403);
    });

    it('returns 422 for invalid amount', async () => {
      const res = await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send({ ...validRecord, amount: -50 });
      expect(res.statusCode).toBe(422);
    });

    it('returns 422 for invalid category', async () => {
      const res = await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send({ ...validRecord, category: 'nonsense' });
      expect(res.statusCode).toBe(422);
    });
  });

  describe('GET /api/records', () => {
    beforeEach(async () => {
      await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(validRecord);
      await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send({ amount: 200, type: 'expense', category: 'food' });
    });

    it('admin can list records', async () => {
      const res = await request(app).get('/api/records').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('analyst can list records', async () => {
      const res = await request(app).get('/api/records').set('Authorization', `Bearer ${analystToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('viewer cannot list records', async () => {
      const res = await request(app).get('/api/records').set('Authorization', `Bearer ${viewerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('can filter by type', async () => {
      const res = await request(app).get('/api/records?type=income').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.every((r) => r.type === 'income')).toBe(true);
    });

    it('supports pagination via meta', async () => {
      const res = await request(app).get('/api/records?page=1&limit=1').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.totalPages).toBe(2);
    });
  });

  describe('PATCH /api/records/:id', () => {
    it('admin can update a record', async () => {
      const create = await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(validRecord);
      const id = create.body.data._id;
      const res = await request(app).patch(`/api/records/${id}`).set('Authorization', `Bearer ${adminToken}`).send({ amount: 9999 });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.amount).toBe(9999);
    });

    it('analyst cannot update a record', async () => {
      const create = await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(validRecord);
      const id = create.body.data._id;
      const res = await request(app).patch(`/api/records/${id}`).set('Authorization', `Bearer ${analystToken}`).send({ amount: 9999 });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/records/:id (soft delete)', () => {
    it('admin can soft-delete a record', async () => {
      const create = await request(app).post('/api/records').set('Authorization', `Bearer ${adminToken}`).send(validRecord);
      const id = create.body.data._id;

      const del = await request(app).delete(`/api/records/${id}`).set('Authorization', `Bearer ${adminToken}`);
      expect(del.statusCode).toBe(200);

      // Record should not appear in list anymore
      const list = await request(app).get('/api/records').set('Authorization', `Bearer ${adminToken}`);
      expect(list.body.data.find((r) => r._id === id)).toBeUndefined();
    });
  });
});
