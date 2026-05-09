const request = require('supertest');
const express = require('express');
const reglaAcumulacionService = require('../../src/services/reglaAcumulacion.service');
const reglaAcumulacionRoutes = require('../../src/routes/reglaAcumulacion.routes');

const app = express();
app.use(express.json());
app.use('/api/v1/reglas-acumulacion', reglaAcumulacionRoutes);

describe('Pruebas de rutas - reglaAcumulacion.routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/reglas-acumulacion debe crear una regla', async () => {
    vi.spyOn(reglaAcumulacionService, 'crearReglaAcumulacion').mockResolvedValue({
      id: 1,
      nombre: 'Regla básica',
      monto_base: 1000,
      puntos_otorgados: 1,
      estado: true
    });

    const response = await request(app)
      .post('/api/v1/reglas-acumulacion')
      .send({
        nombre: 'Regla básica',
        descripcion: 'Por cada 1000 pesos gana 1 punto',
        monto_base: 1000,
        puntos_otorgados: 1,
        estado: true
      });

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.nombre).toBe('Regla básica');
  });

  it('GET /api/v1/reglas-acumulacion debe listar reglas', async () => {
    vi.spyOn(reglaAcumulacionService, 'listarReglasAcumulacion').mockResolvedValue([
      { id: 1, nombre: 'Regla 1' },
      { id: 2, nombre: 'Regla 2' }
    ]);

    const response = await request(app).get('/api/v1/reglas-acumulacion');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('GET /api/v1/reglas-acumulacion/:id debe retornar una regla', async () => {
    vi.spyOn(reglaAcumulacionService, 'obtenerReglaAcumulacionPorId').mockResolvedValue({
      id: 1,
      nombre: 'Regla básica'
    });

    const response = await request(app).get('/api/v1/reglas-acumulacion/1');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.id).toBe(1);
  });

  it('GET /api/v1/reglas-acumulacion/:id debe responder 404 si no existe', async () => {
    vi.spyOn(reglaAcumulacionService, 'obtenerReglaAcumulacionPorId').mockRejectedValue(
      new Error('Regla de acumulación no encontrada')
    );

    const response = await request(app).get('/api/v1/reglas-acumulacion/999');

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Regla de acumulación no encontrada');
  });

  it('PUT /api/v1/reglas-acumulacion/:id debe actualizar una regla', async () => {
    vi.spyOn(reglaAcumulacionService, 'actualizarReglaAcumulacion').mockResolvedValue({
      id: 1,
      nombre: 'Regla actualizada',
      monto_base: 2000,
      puntos_otorgados: 2,
      estado: true
    });

    const response = await request(app)
      .put('/api/v1/reglas-acumulacion/1')
      .send({
        nombre: 'Regla actualizada',
        monto_base: 2000,
        puntos_otorgados: 2,
        estado: true
      });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.nombre).toBe('Regla actualizada');
  });

  it('PATCH /api/v1/reglas-acumulacion/:id/estado debe cambiar el estado', async () => {
    vi.spyOn(reglaAcumulacionService, 'cambiarEstadoReglaAcumulacion').mockResolvedValue({
      id: 1,
      estado: false
    });

    const response = await request(app)
      .patch('/api/v1/reglas-acumulacion/1/estado')
      .send({ estado: false });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.estado).toBe(false);
  });
});