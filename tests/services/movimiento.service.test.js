const movimientoRepository = require('../../src/repositories/movimiento.repository');
const usuarioRepository = require('../../src/repositories/usuario.repository');
const movimientoService = require('../../src/services/movimiento.service');

describe('Pruebas unitarias - movimiento.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('listarMovimientos', () => {
    it('debe retornar la lista de movimientos', async () => {
      const movimientosMock = [
        { id: 1, tipo_movimiento: 'ACUMULACION', puntos: 10 },
        { id: 2, tipo_movimiento: 'REDENCION', puntos: 100 }
      ];

      vi.spyOn(movimientoRepository, 'listarMovimientos').mockResolvedValue(movimientosMock);

      const resultado = await movimientoService.listarMovimientos();

      expect(movimientoRepository.listarMovimientos).toHaveBeenCalled();
      expect(resultado).toHaveLength(2);
    });
  });

  describe('obtenerMovimientoPorId', () => {
    it('debe retornar un movimiento si existe', async () => {
      const movimientoMock = {
        id: 1,
        usuario_id: 1,
        tipo_movimiento: 'ACUMULACION',
        puntos: 5
      };

      vi.spyOn(movimientoRepository, 'obtenerMovimientoPorId').mockResolvedValue(movimientoMock);

      const resultado = await movimientoService.obtenerMovimientoPorId(1);

      expect(movimientoRepository.obtenerMovimientoPorId).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(movimientoMock);
    });

    it('debe lanzar error si el id no es válido', async () => {
      await expect(movimientoService.obtenerMovimientoPorId('abc')).rejects.toThrow(
        'El id del movimiento no es válido'
      );
    });

    it('debe lanzar error si el movimiento no existe', async () => {
      vi.spyOn(movimientoRepository, 'obtenerMovimientoPorId').mockResolvedValue(null);

      await expect(movimientoService.obtenerMovimientoPorId(999)).rejects.toThrow(
        'Movimiento no encontrado'
      );
    });
  });

  describe('listarMovimientosPorUsuario', () => {
    it('debe retornar los movimientos de un usuario', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        nombre: 'Jaider'
      });

      vi.spyOn(movimientoRepository, 'listarMovimientosPorUsuario').mockResolvedValue([
        { id: 1, usuario_id: 1, tipo_movimiento: 'ACUMULACION', puntos: 10 },
        { id: 2, usuario_id: 1, tipo_movimiento: 'REDENCION', puntos: 100 }
      ]);

      const resultado = await movimientoService.listarMovimientosPorUsuario(1);

      expect(usuarioRepository.obtenerUsuarioPorId).toHaveBeenCalledWith(1);
      expect(movimientoRepository.listarMovimientosPorUsuario).toHaveBeenCalledWith(1);
      expect(resultado).toHaveLength(2);
    });

    it('debe lanzar error si usuarioId no es válido', async () => {
      await expect(movimientoService.listarMovimientosPorUsuario('abc')).rejects.toThrow(
        'El usuarioId no es válido'
      );
    });

    it('debe lanzar error si el usuario no existe', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue(null);

      await expect(movimientoService.listarMovimientosPorUsuario(999)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });
});