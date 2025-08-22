
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { login, logout } = require('../controllers/basicAuth/user.controller');
const app = express();

jest.mock('jsonwebtoken');
global.fetch = jest.fn();


app.use(express.json());
app.use(cookieParser());
app.post('/auth/login', login);
app.post('/auth/logout', logout);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and return a token', async () => {
      // Arrange
      const fakeUser = {
        id: '123',
        email: 'test@test.com',
        firstName: 'Momo',
        lastName: 'Shiki',
        userName: 'Momo',
        credits: 0,
        phone: '0600000000',
        role: 'user',
        tier: 'freemium',
        isVerified: true,
      };

      // Simule DataService qui renvoie un user
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: fakeUser }),
      });

      // Simule jwt.sign qui renvoie "fake-token"
      jwt.sign.mockReturnValue('fake-token');

      // Act
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('connexion réussie');
      expect(res.body.token).toBe('fake-token');
      expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({
        id: fakeUser.id,
        email: fakeUser.email,
      }), process.env.JWT_SECRET, { expiresIn: '12h' });
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail if DataService returns error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });
      
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('should fail if fetch throws', async () => {
      global.fetch.mockRejectedValueOnce(new Error('network error'));

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email ou mot de passe incorrect');
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Déconnexion réussie');
      expect(res.headers['set-cookie']).toBeDefined();
      // Vérifie bien que le cookie "token" est supprimé
      expect(res.headers['set-cookie'][0]).toContain('token=;');
    });
  });
});
