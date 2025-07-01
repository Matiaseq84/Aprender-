import request from 'supertest';
import app from '../api/app.js';

describe('POST /login', () => {
  test('Login exitoso devuelve 200 y token', async () => {
    const res = await request(app)
      .post('/login')
      .set('x-test', 'true') 
      .send({
        username: 'admin',
        password: 'admin' 
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Login fallido devuelve 401', async () => {
    const res = await request(app)
      .post('/login')
      .set('x-test', 'true')
      .send({
        username: 'admin',
        password: 'incorrecta'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Credenciales inválidas');
  });
});

