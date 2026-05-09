const pool = require('../../src/config/db');
const compraRepository = require('../../src/repositories/compra.repository');
const usuarioRepository = require('../../src/repositories/usuario.repository');
const reglaAcumulacionRepository = require('../../src/repositories/reglaAcumulacion.repository');
const compraService = require('../../src/services/compra.service');

describe('Pruebas unitarias - compra.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('registrarCompra', () => {
    it('debe registrar una compra correctamente', async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn()
      };

      vi.spyOn(pool, 'connect').mockResolvedValue(mockClient);

      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        nombre: 'Jaider',
        estado: true
      });

      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaActiva').mockResolvedValue({
        id: 1,
        nombre: 'Regla base',
        monto_base: 1000,
        puntos_otorgados: 1
      });

      vi.spyOn(compraRepository, 'crearCompra').mockResolvedValue({
        id: 10,
        usuario_id: 1,
        valor_compra: 5000,
        origen: 'TIENDA',
        observacion: 'Compra prueba',
        fecha_compra: '2026-01-01'
      });

      vi.spyOn(compraRepository, 'crearMovimientoPuntos').mockResolvedValue({});
      vi.spyOn(compraRepository, 'actualizarSaldoPuntos').mockResolvedValue({});
      vi.spyOn(compraRepository, 'crearAuditoria').mockResolvedValue({});

      const resultado = await compraService.registrarCompra({
        usuario_id: 1,
        valor_compra: 5000,
        origen: 'TIENDA',
        observacion: 'Compra prueba'
      });

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(compraRepository.crearCompra).toHaveBeenCalled();
      expect(compraRepository.crearMovimientoPuntos).toHaveBeenCalled();
      expect(compraRepository.actualizarSaldoPuntos).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          usuario_id: 1,
          puntos_sumar: 5
        })
      );
      expect(compraRepository.crearAuditoria).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(resultado.puntos_ganados).toBe(5);
    });

    it('debe lanzar error si usuario_id es inválido', async () => {
      await expect(
        compraService.registrarCompra({
          usuario_id: '',
          valor_compra: 1000,
          origen: 'TIENDA'
        })
      ).rejects.toThrow('El usuario_id es obligatorio y debe ser numérico');
    });

    it('debe lanzar error si valor_compra es inválido', async () => {
      await expect(
        compraService.registrarCompra({
          usuario_id: 1,
          valor_compra: 0,
          origen: 'TIENDA'
        })
      ).rejects.toThrow('El valor_compra debe ser un número mayor a 0');
    });

    it('debe lanzar error si origen es obligatorio', async () => {
      await expect(
        compraService.registrarCompra({
          usuario_id: 1,
          valor_compra: 1000,
          origen: ''
        })
      ).rejects.toThrow('El campo origen es obligatorio');
    });

    it('debe lanzar error si el usuario no existe', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue(null);

      await expect(
        compraService.registrarCompra({
          usuario_id: 99,
          valor_compra: 1000,
          origen: 'TIENDA'
        })
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debe lanzar error si el usuario está inactivo', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: false
      });

      await expect(
        compraService.registrarCompra({
          usuario_id: 1,
          valor_compra: 1000,
          origen: 'TIENDA'
        })
      ).rejects.toThrow('El usuario está inactivo y no puede registrar compras');
    });

    it('debe lanzar error si no existe regla activa', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: true
      });

      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaActiva').mockResolvedValue(null);

      await expect(
        compraService.registrarCompra({
          usuario_id: 1,
          valor_compra: 1000,
          origen: 'TIENDA'
        })
      ).rejects.toThrow('No existe una regla de acumulación activa');
    });

    it('debe hacer rollback si ocurre un error en la transacción', async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn()
      };

      vi.spyOn(pool, 'connect').mockResolvedValue(mockClient);

      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: true
      });

      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaActiva').mockResolvedValue({
        id: 1,
        nombre: 'Regla base',
        monto_base: 1000,
        puntos_otorgados: 1
      });

      vi.spyOn(compraRepository, 'crearCompra').mockRejectedValue(new Error('Error de BD'));

      await expect(
        compraService.registrarCompra({
          usuario_id: 1,
          valor_compra: 5000,
          origen: 'TIENDA'
        })
      ).rejects.toThrow('Error de BD');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('listarCompras', () => {
    it('debe retornar la lista de compras', async () => {
      vi.spyOn(compraRepository, 'listarCompras').mockResolvedValue([
        { id: 1, usuario_id: 1 },
        { id: 2, usuario_id: 2 }
      ]);

      const resultado = await compraService.listarCompras();

      expect(compraRepository.listarCompras).toHaveBeenCalled();
      expect(resultado).toHaveLength(2);
    });
  });

  describe('obtenerCompraPorId', () => {
    it('debe retornar una compra si existe', async () => {
      vi.spyOn(compraRepository, 'obtenerCompraPorId').mockResolvedValue({
        id: 1,
        usuario_id: 1
      });

      const resultado = await compraService.obtenerCompraPorId(1);

      expect(compraRepository.obtenerCompraPorId).toHaveBeenCalledWith(1);
      expect(resultado.id).toBe(1);
    });

    it('debe lanzar error si el id no es válido', async () => {
      await expect(compraService.obtenerCompraPorId('abc')).rejects.toThrow(
        'El id de la compra no es válido'
      );
    });

    it('debe lanzar error si la compra no existe', async () => {
      vi.spyOn(compraRepository, 'obtenerCompraPorId').mockResolvedValue(null);

      await expect(compraService.obtenerCompraPorId(999)).rejects.toThrow(
        'Compra no encontrada'
      );
    });
  });
});