const request = require('supertest');
const express = require('express');
const reglaRedencionService = require('../../src/services/reglaRedencion.service');
const reglaRedencionRoutes = require('../../src/routes/reglaRedencion.routes');

const app = express();
app.use(express.json());
app.use('/api/v1/reglas-redencion', reglaRedencionRoutes);

describe('Pruebas de rutas - reglaRedencion.routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/reglas-redencion debe crear una regla', async () => {
    vi.spyOn(reglaRedencionService, 'crearReglaRedencion').mockResolvedValue({
      id: 1,
      nombre: 'Redención básica',
      puntos_requeridos: 100,
      valor_equivalente: 10000,
      estado: true
    });

    const response = await request(app)
      .post('/api/v1/reglas-redencion')
      .send({
        nombre: 'Redención básica',
        descripcion: '100 puntos por 10000 pesos',
        puntos_requeridos: 100,
        valor_equivalente: 10000,
        estado: true
      });

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.nombre).toBe('Redención básica');
  });

  it('GET /api/v1/reglas-redencion debe listar reglas', async () => {
    vi.spyOn(reglaRedencionService, 'listarReglasRedencion').mockResolvedValue([
      { id: 1, nombre: 'Regla 1' },
      { id: 2, nombre: 'Regla 2' }
    ]);

    const response = await request(app).get('/api/v1/reglas-redencion');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('GET /api/v1/reglas-redencion/:id debe retornar una regla', async () => {
    vi.spyOn(reglaRedencionService, 'obtenerReglaRedencionPorId').mockResolvedValue({
      id: 1,
      nombre: 'Redención básica'
    });

    const response = await request(app).get('/api/v1/reglas-redencion/1');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.id).toBe(1);
  });

  it('GET /api/v1/reglas-redencion/:id debe responder 404 si no existe', async () => {
    vi.spyOn(reglaRedencionService, 'obtenerReglaRedencionPorId').mockRejectedValue(
      new Error('Regla de redención no encontrada')
    );

    const response = await request(app).get('/api/v1/reglas-redencion/999');

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Regla de redención no encontrada');
  });

  it('PUT /api/v1/reglas-redencion/:id debe actualizar una regla', async () => {
    vi.spyOn(reglaRedencionService, 'actualizarReglaRedencion').mockResolvedValue({
      id: 1,
      nombre: 'Redención actualizada',
      puntos_requeridos: 150,
      valor_equivalente: 15000,
      estado: true
    });

    const response = await request(app)
      .put('/api/v1/reglas-redencion/1')
      .send({
        nombre: 'Redención actualizada',
        puntos_requeridos: 150,
        valor_equivalente: 15000,
        estado: true
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.nombre).toBe('Redención actualizada');
  });

  it('PATCH /api/v1/reglas-redencion/:id/estado debe cambiar el estado', async () => {
    vi.spyOn(reglaRedencionService, 'cambiarEstadoReglaRedencion').mockResolvedValue({
      id: 1,
      estado: false
    });

    const response = await request(app)
      .patch('/api/v1/reglas-redencion/1/estado')
      .send({ estado: false });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.estado).toBe(false);
  });
});