const request = require('supertest');
const express = require('express');
const compraService = require('../../src/services/compra.service');
const compraRoutes = require('../../src/routes/compra.routes');

const app = express();
app.use(express.json());
app.use('/api/v1/compras', compraRoutes);

describe('Pruebas de rutas - compra.routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /api/v1/compras debe registrar una compra', async () => {
    vi.spyOn(compraService, 'registrarCompra').mockResolvedValue({
      compra_id: 1,
      usuario_id: 1,
      valor_compra: 5000,
      origen: 'TIENDA',
      puntos_ganados: 5
    });

    const response = await request(app)
      .post('/api/v1/compras')
      .send({
        usuario_id: 1,
        valor_compra: 5000,
        origen: 'TIENDA',
        observacion: 'Compra test'
      });

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.compra_id).toBe(1);
    expect(response.body.data.puntos_ganados).toBe(5);
  });

  it('GET /api/v1/compras debe listar compras', async () => {
    vi.spyOn(compraService, 'listarCompras').mockResolvedValue([
      { id: 1, usuario_id: 1 },
      { id: 2, usuario_id: 2 }
    ]);

    const response = await request(app).get('/api/v1/compras');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it('GET /api/v1/compras/:id debe retornar una compra', async () => {
    vi.spyOn(compraService, 'obtenerCompraPorId').mockResolvedValue({
      id: 1,
      usuario_id: 1,
      valor_compra: 5000
    });

    const response = await request(app).get('/api/v1/compras/1');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.id).toBe(1);
  });

  it('GET /api/v1/compras/:id debe responder 404 si no existe', async () => {
    vi.spyOn(compraService, 'obtenerCompraPorId').mockRejectedValue(
      new Error('Compra no encontrada')
    );

    const response = await request(app).get('/api/v1/compras/999');

    expect(response.status).toBe(404);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe('Compra no encontrada');
  });
});