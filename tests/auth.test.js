process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRES_IN = '1d';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('./helpers/db');

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clearAll(); });
afterAll(async () => { await db.disconnect(); });

describe('Auth Routes', () => {
  const baseUser = { name: 'Test User', email: 'test@example.com', password: 'password123' };

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app).post('/api/auth/register').send(baseUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(baseUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should default the role to viewer on public registration', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...baseUser, role: 'admin' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.role).toBe('viewer');
    });

    it('should return 409 for a duplicate email', async () => {
      await request(app).post('/api/auth/register').send(baseUser);
      const res = await request(app).post('/api/auth/register').send(baseUser);
      expect(res.statusCode).toBe(409);
    });

    it('should return 422 for missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'bad' });
      expect(res.statusCode).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 422 for a short password', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...baseUser, password: '123' });
      expect(res.statusCode).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(baseUser);
    });

    it('should log in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: baseUser.email,
        password: baseUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: baseUser.email,
        password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 for unknown email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the current user with a valid token', async () => {
      const reg = await request(app).post('/api/auth/register').send(baseUser);
      const token = reg.body.data.token;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe(baseUser.email);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });
});
