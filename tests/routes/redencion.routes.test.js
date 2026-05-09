const request = require('supertest');
const express = require('express');
const redencionService = require('../../src/services/redencion.service');
const redencionRoutes = require('../../src/routes/redencion.routes');

const app = express();
app.use(express.json());
app.use('/api/v1/redenciones', redencionRoutes);

describe('Pruebas de rutas - redencion.routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/redenciones debe registrar una redención', async () => {
    vi.spyOn(redencionService, 'registrarRedencion').mockResolvedValue({
      redencion_id: 1,
      usuario_id: 1,
      regla_redencion_id: 1,
      puntos_usados: 100,
      valor_redimido: 10000,
      codigo_unico: 'RED-123'
    });

    const response = await request(app)
      .post('/api/v1/redenciones')
      .send({
        usuario_id: 1,
        regla_redencion_id: 1,
        observacion: 'Redención test'
      });

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.redencion_id).toBe(1);
  });

  it('GET /api/v1/redenciones debe listar redenciones', async () => {
    vi.spyOn(redencionService, 'listarRedenciones').mockResolvedValue([
      { id: 1, usuario_id: 1 },
      { id: 2, usuario_id: 2 }
    ]);

    const response = await request(app).get('/api/v1/redenciones');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('GET /api/v1/redenciones/:id debe retornar una redención', async () => {
    vi.spyOn(redencionService, 'obtenerRedencionPorId').mockResolvedValue({
      id: 1,
      usuario_id: 1,
      puntos_usados: 100
    });

    const response = await request(app).get('/api/v1/redenciones/1');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.id).toBe(1);
  });

  it('GET /api/v1/redenciones/:id debe responder 404 si no existe', async () => {
    vi.spyOn(redencionService, 'obtenerRedencionPorId').mockRejectedValue(
      new Error('Redención no encontrada')
    );

    const response = await request(app).get('/api/v1/redenciones/999');

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Redención no encontrada');
  });
});