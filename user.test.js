// user.test.js

const request = require('supertest');
const app = require('../app');

describe('User management', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        password: 'password'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
