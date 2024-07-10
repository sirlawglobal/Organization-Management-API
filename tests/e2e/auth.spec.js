// tests/organisation.e2e.test.js
process.env.JWT_SECRET = 'your_secret_key';
const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app
const Organisation = require('../../models/Organisation');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../../models/Organisation');
jest.mock('../../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Organisation Endpoints', () => {
  let token;
  let userId;
  let orgId;

  beforeAll(() => {
    // Mock userId and generate token
    userId = 1;
    token = generateToken(userId);
  });

  describe('POST /api/organisations', () => {
    it('should create a new organisation', async () => {
      Organisation.addOrganisation.mockResolvedValue({ orgid: 1, name: 'Test Org', description: '' });
      Organisation.addUserToOrg.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/organisations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Org', description: 'A test organisation' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Organisation created successfully');
      expect(response.body.data).toMatchObject({ orgid: 1, name: 'Test Org', description: '' });

      orgId = response.body.data.orgid;
    });

    it('should return 422 if name is missing', async () => {
      const response = await request(app)
        .post('/api/organisations')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'A test organisation' });

      expect(response.status).toBe(422);
      expect(response.body.errors).toEqual([{ field: 'name', message: 'Name is required' }]);
    });
  });

  describe('GET /organisations', () => {
    it('should get user organisations', async () => {
      Organisation.findOrgsByUserId.mockResolvedValue([{ orgid: 1, name: 'Test Org', description: '' }]);

      const response = await request(app)
        .get('/api/organisations')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.organisations).toEqual([{ orgid: 1, name: 'Test Org', description: '' }]);
    });
  });

  describe('GET /organisations/:orgId', () => {
    it('should get an organisation by ID', async () => {
      Organisation.findOrgById.mockResolvedValue({ orgid: 1, name: 'Test Org', description: '' });

      const response = await request(app)
        .get(`/api/organisations/${orgId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({ orgid: 1, name: 'Test Org', description: '' });
    });

    it('should return 404 if organisation is not found', async () => {
      Organisation.findOrgById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/organisations/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Organisation not found');
    });
  });

  describe('POST /organisations/:orgId/users', () => {
    it('should add a user to an organisation', async () => {
      Organisation.findOrgById.mockResolvedValue({ orgid: 1, name: 'Test Org', description: '' });
      User.findUserById.mockResolvedValue({ userid: 2, firstname: 'Jane', lastname: 'Doe', email: 'jane.doe@example.com' });
      Organisation.addUserToOrg.mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/organisations/${orgId}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 2 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User added to organisation successfully');
    });

    it('should return 404 if organisation is not found', async () => {
      Organisation.findOrgById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/organisations/999/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 2 });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Organisation not found');
    });

    it('should return 404 if user is not found', async () => {
      Organisation.findOrgById.mockResolvedValue({ orgid: 1, name: 'Test Org', description: '' });
      User.findUserById.mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/organisations/${orgId}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 999 });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /users/:id', () => {
    it('should get a user by ID', async () => {
      User.findUserById.mockResolvedValue({ userid: 1, firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' });

      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({ userid: 1, firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' });
    });

    it('should return 404 if user is not found', async () => {
      User.findUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });
});
