const request = require('supertest');
const express = require('express');

const usuarioService = require('../../src/services/usuario.service');
const usuarioRoutes = require('../../src/routes/usuario.routes');

const app = express();
app.use(express.json());
app.use('/api/v1/usuarios', usuarioRoutes);

describe('Pruebas de rutas - usuario.routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/usuarios/registro debe registrar un usuario', async () => {
    vi.spyOn(usuarioService, 'registrarUsuario').mockResolvedValue({
      id: 10,
      nombre: 'Usuario Registro',
      correo: 'registro@mail.com'
    });

    const response = await request(app)
      .post('/api/v1/usuarios/registro')
      .send({
        tipo_documento: 'CC',
        numero_documento: '10101010',
        nombre: 'Usuario Registro',
        correo: 'registro@mail.com',
        telefono: '3001234567',
        contrasena: 'secreta123'
      });

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.correo).toBe('registro@mail.com');
  });

  it('POST /api/v1/usuarios/registro debe responder 400 si el registro falla', async () => {
    vi.spyOn(usuarioService, 'registrarUsuario').mockRejectedValue(
      new Error(
        'Los campos tipo_documento, numero_documento, nombre, correo y contrasena son obligatorios'
      )
    );

    const response = await request(app)
      .post('/api/v1/usuarios/registro')
      .send({
        correo: 'registro@mail.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toContain('obligatorios');
  });

  it('POST /api/v1/usuarios/login debe iniciar sesion', async () => {
    vi.spyOn(usuarioService, 'iniciarSesion').mockResolvedValue({
      usuario: {
        id: 10,
        correo: 'login@mail.com'
      },
      token: 'token-prueba'
    });

    const response = await request(app)
      .post('/api/v1/usuarios/login')
      .send({
        correo: 'login@mail.com',
        contrasena: 'secreta123'
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.usuario.correo).toBe('login@mail.com');
    expect(response.body.data.token).toBe('token-prueba');
  });

  it('POST /api/v1/usuarios/login debe responder 401 si las credenciales son invalidas', async () => {
    vi.spyOn(usuarioService, 'iniciarSesion').mockRejectedValue(
      new Error('Credenciales invalidas')
    );

    const response = await request(app)
      .post('/api/v1/usuarios/login')
      .send({
        correo: 'login@mail.com',
        contrasena: 'incorrecta'
      });

    expect(response.status).toBe(401);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Credenciales invalidas');
  });

  it('POST /api/v1/usuarios/login debe responder 403 si el usuario esta inactivo', async () => {
    vi.spyOn(usuarioService, 'iniciarSesion').mockRejectedValue(new Error('Usuario inactivo'));

    const response = await request(app)
      .post('/api/v1/usuarios/login')
      .send({
        correo: 'inactivo@mail.com',
        contrasena: 'secreta123'
      });

    expect(response.status).toBe(403);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Usuario inactivo');
  });

  it('POST /api/v1/usuarios debe crear un usuario', async () => {
    vi.spyOn(usuarioService, 'crearUsuario').mockResolvedValue({
      id: 1,
      nombre: 'Jaider Rios'
    });

    const response = await request(app)
      .post('/api/v1/usuarios')
      .send({
        tipo_documento: 'CC',
        numero_documento: '123456789',
        nombre: 'Jaider Rios',
        correo: 'jaider@mail.com',
        telefono: '3001234567'
      });

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.nombre).toBe('Jaider Rios');
  });

  it('GET /api/v1/usuarios debe listar usuarios', async () => {
    vi.spyOn(usuarioService, 'listarUsuarios').mockResolvedValue([
      { id: 1, nombre: 'Jaider Rios' },
      { id: 2, nombre: 'Ana Torres' }
    ]);

    const response = await request(app).get('/api/v1/usuarios');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('GET /api/v1/usuarios/:id debe retornar un usuario', async () => {
    vi.spyOn(usuarioService, 'obtenerUsuarioPorId').mockResolvedValue({
      id: 1,
      nombre: 'Jaider Rios'
    });

    const response = await request(app).get('/api/v1/usuarios/1');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.id).toBe(1);
  });

  it('GET /api/v1/usuarios/:id debe responder 404 si no existe', async () => {
    vi.spyOn(usuarioService, 'obtenerUsuarioPorId').mockRejectedValue(
      new Error('Usuario no encontrado')
    );

    const response = await request(app).get('/api/v1/usuarios/999');

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Usuario no encontrado');
  });

  it('PATCH /api/v1/usuarios/:id/estado debe cambiar el estado', async () => {
    vi.spyOn(usuarioService, 'cambiarEstadoUsuario').mockResolvedValue({
      id: 1,
      estado: false
    });

    const response = await request(app)
      .patch('/api/v1/usuarios/1/estado')
      .send({ estado: false });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.estado).toBe(false);
  });

  it('GET /api/v1/usuarios/:id/saldo debe retornar el saldo', async () => {
    vi.spyOn(usuarioService, 'obtenerSaldoUsuario').mockResolvedValue({
      usuario_id: 1,
      saldo_actual: 25
    });

    const response = await request(app).get('/api/v1/usuarios/1/saldo');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.saldo_actual).toBe(25);
  });
  it('POST /api/v1/usuarios debe responder 400 si el service lanza error', async () => {
  vi.spyOn(usuarioService, 'crearUsuario').mockRejectedValue(
    new Error('Ya existe un usuario con ese número de documento')
  );

  const response = await request(app)
    .post('/api/v1/usuarios')
    .send({
      tipo_documento: 'CC',
      numero_documento: '123456789',
      nombre: 'Jaider Rios'
    });

  expect(response.status).toBe(400);
  expect(response.body.ok).toBe(false);
  expect(response.body.mensaje).toBe('Ya existe un usuario con ese número de documento');
});

it('GET /api/v1/usuarios debe responder 500 si ocurre un error', async () => {
  vi.spyOn(usuarioService, 'listarUsuarios').mockRejectedValue(
    new Error('Error interno')
  );

  const response = await request(app).get('/api/v1/usuarios');

  expect(response.status).toBe(500);
  expect(response.body.ok).toBe(false);
  expect(response.body.mensaje).toBe('Error interno');
});

it('GET /api/v1/usuarios/:id debe responder 400 si el id es inválido', async () => {
  vi.spyOn(usuarioService, 'obtenerUsuarioPorId').mockRejectedValue(
    new Error('El id del usuario no es válido')
  );

  const response = await request(app).get('/api/v1/usuarios/abc');

  expect(response.status).toBe(400);
  expect(response.body.ok).toBe(false);
  expect(response.body.mensaje).toBe('El id del usuario no es válido');
});

it('PATCH /api/v1/usuarios/:id/estado debe responder 400 si estado es inválido', async () => {
  vi.spyOn(usuarioService, 'cambiarEstadoUsuario').mockRejectedValue(
    new Error('El campo estado debe ser true o false')
  );

  const response = await request(app)
    .patch('/api/v1/usuarios/1/estado')
    .send({ estado: 'false' });

  expect(response.status).toBe(400);
  expect(response.body.ok).toBe(false);
  expect(response.body.mensaje).toBe('El campo estado debe ser true o false');
});

it('GET /api/v1/usuarios/:id/saldo debe responder 404 si no existe saldo', async () => {
  vi.spyOn(usuarioService, 'obtenerSaldoUsuario').mockRejectedValue(
    new Error('Saldo no encontrado')
  );

  const response = await request(app).get('/api/v1/usuarios/1/saldo');

  expect(response.status).toBe(404);
  expect(response.body.ok).toBe(false);
  expect(response.body.mensaje).toBe('Saldo no encontrado');
});

it('GET /api/v1/usuarios/:id/saldo debe responder 400 si el id es inválido', async () => {
  vi.spyOn(usuarioService, 'obtenerSaldoUsuario').mockRejectedValue(
    new Error('El id del usuario no es válido')
  );

  const response = await request(app).get('/api/v1/usuarios/abc/saldo');

  expect(response.status).toBe(400);
  expect(response.body.ok).toBe(false);
  expect(response.body.mensaje).toBe('El id del usuario no es válido');
});
});
