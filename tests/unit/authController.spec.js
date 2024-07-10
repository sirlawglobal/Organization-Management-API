const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../app');  // Ensure the correct path to your app
const User = require('../../models/User');
const Organisation = require('../../models/Organisation');
const { clearUsers } = require('../../models/User');
const pool = require('../../config/db');
// Mock the dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../models/User');
jest.mock('../../models/Organisation');

beforeAll(async () => {
  await clearUsers();
});

beforeEach(() => {
  jest.clearAllMocks();
});


// afterAll(async () => {
//   await pool.end(); 
//   app.close(); 
// });


describe('Auth Controller', () => {
  describe('Register User', () => {
    test('should register user successfully with default organisation', 
      
      async () => {
      const userPayload = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      };

      const hashedPassword = 'hashedPassword';
      const newUser = {
        userid: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: hashedPassword,
      };
      const newOrg = {
        orgid: 1,
        name: "John's Organisation",
        description: '',
      };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.findUserByEmail.mockResolvedValue(null);
      User.addUser.mockResolvedValue(newUser);
      Organisation.addOrganisation.mockResolvedValue(newOrg);
      Organisation.addUserToOrg.mockResolvedValue();

      const token = 'token';
      jwt.sign.mockReturnValue(token);

      const response = await request(app)
        .post('/auth/register')
        .send(userPayload);

      expect(response.statusCode).toBe(201);
      expect(response.body.data.user).toHaveProperty('userId');
      expect(response.body.data.user.email).toBe('john.doe@example.com');
      expect(response.body.data).toHaveProperty('accessToken');
    });

    test('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'jane.doe@example.com',
        });

      expect(response.statusCode).toBe(422);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should fail if user already exists', async () => {
      const userPayload = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      };

      const existingUser = {
        userid: 1,
        email: 'jane.doe@example.com',
      };

      User.findUserByEmail.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/auth/register')
        .send(userPayload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Registration unsuccessful');
    });
  });

  describe('Login User', () => {
    test('should log the user in successfully', async () => {
      const userPayload = {
        email: 'jane.doe@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword';
      const user = {
        userid: 1,
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone: '1234567890',
        password: hashedPassword,
      };

      User.findUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const token = 'token';
      jwt.sign.mockReturnValue(token);

      const response = await request(app)
        .post('/auth/login')
        .send(userPayload);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.user).toHaveProperty('userId');
      expect(response.body.data.user.email).toBe('jane.doe@example.com');
      expect(response.body.data).toHaveProperty('accessToken');
    });

    test('should fail if email and password are missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.statusCode).toBe(422);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should fail if authentication fails', async () => {
      const userPayload = {
        email: 'jane.doe@example.com',
        password: 'password123',
      };

      User.findUserByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(userPayload);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Authentication failed');
    });

    test('should fail if password is incorrect', async () => {
      const userPayload = {
        email: 'jane.doe@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword';
      const user = {
        userid: 1,
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane.doe@example.com',
        phone: '1234567890',
        password: hashedPassword,
      };

      User.findUserByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send(userPayload);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Authentication failed');
    });
  });
});



