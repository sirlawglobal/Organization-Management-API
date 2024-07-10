// tests/authMiddleware.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.test' });

const authMiddleware = require('../../middleware/authMiddleware'); // Adjust the path to your middleware file

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Add a test route that uses the auth middleware
    app.get('/protected', authMiddleware, (req, res) => {
      res.status(200).json({ status: 'success', message: 'Access Granted' });
    });
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Access Denied');
  });

  it('should return 401 if token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid Token');
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Invalid Token');
  });

  it('should call next if token is valid', async () => {
    const user = { userId: 1 };
    jwt.verify.mockImplementation(() => user);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validtoken');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Access Granted');
  });
});
