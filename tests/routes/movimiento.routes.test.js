const request = require('supertest');
const express = require('express');
const movimientoService = require('../../src/services/movimiento.service');
const movimientoRoutes = require('../../src/routes/movimiento.routes');

const app = express();
app.use(express.json());
app.use('/api/v1/movimientos', movimientoRoutes);

describe('Pruebas de rutas - movimiento.routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/v1/movimientos debe listar movimientos', async () => {
    vi.spyOn(movimientoService, 'listarMovimientos').mockResolvedValue([
      { id: 1, tipo_movimiento: 'ACUMULACION', puntos: 10 },
      { id: 2, tipo_movimiento: 'REDENCION', puntos: 100 }
    ]);

    const response = await request(app).get('/api/v1/movimientos');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('GET /api/v1/movimientos/:id debe retornar un movimiento', async () => {
    vi.spyOn(movimientoService, 'obtenerMovimientoPorId').mockResolvedValue({
      id: 1,
      usuario_id: 1,
      tipo_movimiento: 'ACUMULACION',
      puntos: 10
    });

    const response = await request(app).get('/api/v1/movimientos/1');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.id).toBe(1);
  });

  it('GET /api/v1/movimientos/:id debe responder 404 si no existe', async () => {
    vi.spyOn(movimientoService, 'obtenerMovimientoPorId').mockRejectedValue(
      new Error('Movimiento no encontrado')
    );

    const response = await request(app).get('/api/v1/movimientos/999');

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Movimiento no encontrado');
  });

  it('GET /api/v1/movimientos/usuario/:usuarioId debe retornar movimientos del usuario', async () => {
    vi.spyOn(movimientoService, 'listarMovimientosPorUsuario').mockResolvedValue([
      { id: 1, usuario_id: 1, tipo_movimiento: 'ACUMULACION', puntos: 10 },
      { id: 2, usuario_id: 1, tipo_movimiento: 'REDENCION', puntos: 100 }
    ]);

    const response = await request(app).get('/api/v1/movimientos/usuario/1');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('GET /api/v1/movimientos/usuario/:usuarioId debe responder 404 si el usuario no existe', async () => {
    vi.spyOn(movimientoService, 'listarMovimientosPorUsuario').mockRejectedValue(
      new Error('Usuario no encontrado')
    );

    const response = await request(app).get('/api/v1/movimientos/usuario/999');

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Usuario no encontrado');
  });
});