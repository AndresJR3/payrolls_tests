// src/__tests__/api.test.js
const request = require('supertest');
const app = require('../index');

describe('API de Nóminas', () => {
  let authToken = '';
  let testUserId = '';
  let testPayrollId = '';

  // Setup: Crear usuario de prueba
  beforeAll(async () => {
    // Registrar usuario de prueba
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    // Hacer login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
    testUserId = loginResponse.body.user.id;
  });

  describe('Autenticación', () => {
    it('debería registrar un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Usuario registrado exitosamente');
      expect(res.body.user.email).toBe('newuser@example.com');
    });

    it('no debería registrar usuario con email duplicado', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Email en uso');
    });

    it('no debería registrar usuario con contraseña muy corta', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'shortpass@example.com',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Contraseña muy corta');
    });

    it('debería hacer login con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Login exitoso');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('no debería hacer login con credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Credenciales inválidas');
    });

    it('debería obtener perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('test@example.com');
    });
  });

  describe('Nóminas', () => {
    it('debería crear una nueva nómina', async () => {
      const res = await request(app)
        .post('/api/payrolls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_name: 'Juan Pérez',
          salary: 15000,
          pay_date: '2024-01-15'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Nómina creada exitosamente');
      expect(res.body.payroll.employee_name).toBe('Juan Pérez');
      expect(res.body.payroll.salary).toBe('15000.00');

      testPayrollId = res.body.payroll.id;
    });

    it('no debería crear nómina sin autenticación', async () => {
      const res = await request(app)
        .post('/api/payrolls')
        .send({
          employee_name: 'Juan Pérez',
          salary: 15000,
          pay_date: '2024-01-15'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Token de acceso requerido');
    });

    it('no debería crear nómina con datos faltantes', async () => {
      const res = await request(app)
        .post('/api/payrolls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_name: 'Juan Pérez'
          // Faltan salary y pay_date
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Campos requeridos');
    });

    it('no debería crear nómina con salario inválido', async () => {
      const res = await request(app)
        .post('/api/payrolls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_name: 'Juan Pérez',
          salary: -1000,
          pay_date: '2024-01-15'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Salario inválido');
    });

    it('debería obtener todas las nóminas del usuario', async () => {
      const res = await request(app)
        .get('/api/payrolls')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.payrolls).toBeDefined();
      expect(Array.isArray(res.body.payrolls)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('debería obtener una nómina específica', async () => {
      const res = await request(app)
        .get(`/api/payrolls/${testPayrollId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.payroll).toBeDefined();
      expect(res.body.payroll.id).toBe(testPayrollId);
      expect(res.body.payroll.employee_name).toBe('Juan Pérez');
    });

    it('no debería obtener nómina inexistente', async () => {
      const res = await request(app)
        .get('/api/payrolls/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Nómina no encontrada');
    });

    it('debería actualizar una nómina existente', async () => {
      const res = await request(app)
        .put(`/api/payrolls/${testPayrollId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_name: 'Juan Pérez Actualizado',
          salary: 16000,
          pay_date: '2024-01-20'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Nómina actualizada exitosamente');
      expect(res.body.payroll.employee_name).toBe('Juan Pérez Actualizado');
      expect(res.body.payroll.salary).toBe('16000.00');
    });

    it('debería actualizar parcialmente una nómina', async () => {
      const res = await request(app)
        .put(`/api/payrolls/${testPayrollId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          salary: 17000
          // Solo actualizar el salario
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.payroll.salary).toBe('17000.00');
      expect(res.body.payroll.employee_name).toBe('Juan Pérez Actualizado');
    });

    it('debería obtener estadísticas de nóminas', async () => {
      const res = await request(app)
        .get('/api/payrolls/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.general).toBeDefined();
      expect(res.body.monthly).toBeDefined();
      expect(res.body.general.total_payrolls).toBeDefined();
      expect(res.body.general.total_salary).toBeDefined();
    });

    it('debería eliminar una nómina', async () => {
      const res = await request(app)
        .delete(`/api/payrolls/${testPayrollId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Nómina eliminada exitosamente');
    });

    it('no debería eliminar nómina ya eliminada', async () => {
      const res = await request(app)
        .delete(`/api/payrolls/${testPayrollId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Nómina no encontrada');
    });
  });

  describe('Seguridad', () => {
    it('no debería acceder a recursos sin token', async () => {
      const res = await request(app)
        .get('/api/payrolls');

      expect(res.statusCode).toBe(401);
    });

    it('no debería acceder con token inválido', async () => {
      const res = await request(app)
        .get('/api/payrolls')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Ruta raíz', () => {
    it('debería devolver mensaje de bienvenida en GET /', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('API de Nóminas está funcionando!');
    });
  });
});
