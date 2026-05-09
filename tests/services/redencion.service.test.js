
const pool = require('../../src/config/db');
const redencionRepository = require('../../src/repositories/redencion.repository');
const usuarioRepository = require('../../src/repositories/usuario.repository');
const reglaRedencionRepository = require('../../src/repositories/reglaRedencion.repository');
const redencionService = require('../../src/services/redencion.service');

describe('Pruebas unitarias - redencion.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('registrarRedencion', () => {
    it('debe registrar una redención correctamente', async () => {
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

      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Redención básica',
        puntos_requeridos: 100,
        valor_equivalente: 10000,
        estado: true
      });

      vi.spyOn(usuarioRepository, 'obtenerSaldoUsuario').mockResolvedValue({
        usuario_id: 1,
        saldo_actual: 150
      });

      vi.spyOn(redencionRepository, 'crearRedencion').mockResolvedValue({
        id: 10,
        usuario_id: 1,
        regla_redencion_id: 1,
        puntos_usados: 100,
        valor_redimido: 10000,
        codigo_unico: 'RED-TEST-123',
        observacion: 'Prueba',
        fecha_redencion: '2026-01-01'
      });

      vi.spyOn(redencionRepository, 'crearMovimientoPuntos').mockResolvedValue({});
      vi.spyOn(redencionRepository, 'descontarSaldoPuntos').mockResolvedValue({});
      vi.spyOn(redencionRepository, 'crearAuditoria').mockResolvedValue({});

      const resultado = await redencionService.registrarRedencion({
        usuario_id: 1,
        regla_redencion_id: 1,
        observacion: 'Prueba'
      });

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(redencionRepository.crearRedencion).toHaveBeenCalled();
      expect(redencionRepository.crearMovimientoPuntos).toHaveBeenCalled();
      expect(redencionRepository.descontarSaldoPuntos).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          usuario_id: 1,
          puntos_restar: 100
        })
      );
      expect(redencionRepository.crearAuditoria).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(resultado.redencion_id).toBe(10);
      expect(resultado.puntos_usados).toBe(100);
    });

    it('debe lanzar error si usuario_id es inválido', async () => {
      await expect(
        redencionService.registrarRedencion({
          usuario_id: '',
          regla_redencion_id: 1
        })
      ).rejects.toThrow('El usuario_id es obligatorio y debe ser numérico');
    });

    it('debe lanzar error si regla_redencion_id es inválido', async () => {
      await expect(
        redencionService.registrarRedencion({
          usuario_id: 1,
          regla_redencion_id: ''
        })
      ).rejects.toThrow('El regla_redencion_id es obligatorio y debe ser numérico');
    });

    it('debe lanzar error si el usuario no existe', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue(null);

      await expect(
        redencionService.registrarRedencion({
          usuario_id: 99,
          regla_redencion_id: 1
        })
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debe lanzar error si el usuario está inactivo', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: false
      });

      await expect(
        redencionService.registrarRedencion({
          usuario_id: 1,
          regla_redencion_id: 1
        })
      ).rejects.toThrow('El usuario está inactivo y no puede redimir puntos');
    });

    it('debe lanzar error si la regla no existe', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: true
      });

      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue(null);

      await expect(
        redencionService.registrarRedencion({
          usuario_id: 1,
          regla_redencion_id: 99
        })
      ).rejects.toThrow('Regla de redención no encontrada');
    });

    it('debe lanzar error si la regla está inactiva', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: true
      });

      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue({
        id: 1,
        estado: false
      });

      await expect(
        redencionService.registrarRedencion({
          usuario_id: 1,
          regla_redencion_id: 1
        })
      ).rejects.toThrow('La regla de redención está inactiva');
    });

    it('debe lanzar error si no existe saldo', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: true
      });

      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Redención básica',
        puntos_requeridos: 100,
        valor_equivalente: 10000,
        estado: true
      });

      vi.spyOn(usuarioRepository, 'obtenerSaldoUsuario').mockResolvedValue(null);

      await expect(
        redencionService.registrarRedencion({
          usuario_id: 1,
          regla_redencion_id: 1
        })
      ).rejects.toThrow('Saldo no encontrado');
    });

    it('debe lanzar error si no tiene puntos suficientes', async () => {
      vi.spyOn(usuarioRepository, 'obtenerUsuarioPorId').mockResolvedValue({
        id: 1,
        estado: true
      });

      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Redención básica',
        puntos_requeridos: 100,
        valor_equivalente: 10000,
        estado: true
      });

      vi.spyOn(usuarioRepository, 'obtenerSaldoUsuario').mockResolvedValue({
        usuario_id: 1,
        saldo_actual: 50
      });

      await expect(
        redencionService.registrarRedencion({
          usuario_id: 1,
          regla_redencion_id: 1
        })
      ).rejects.toThrow('El usuario no tiene puntos suficientes para redimir');
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

      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Redención básica',
        puntos_requeridos: 100,
        valor_equivalente: 10000,
        estado: true
      });

      vi.spyOn(usuarioRepository, 'obtenerSaldoUsuario').mockResolvedValue({
        usuario_id: 1,
        saldo_actual: 200
      });

      vi.spyOn(redencionRepository, 'crearRedencion').mockRejectedValue(new Error('Error de BD'));

      await expect(
        redencionService.registrarRedencion({
          usuario_id: 1,
          regla_redencion_id: 1
        })
      ).rejects.toThrow('Error de BD');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('listarRedenciones', () => {
    it('debe retornar la lista de redenciones', async () => {
      vi.spyOn(redencionRepository, 'listarRedenciones').mockResolvedValue([
        { id: 1, usuario_id: 1 },
        { id: 2, usuario_id: 2 }
      ]);

      const resultado = await redencionService.listarRedenciones();

      expect(redencionRepository.listarRedenciones).toHaveBeenCalled();
      expect(resultado).toHaveLength(2);
    });
  });

  describe('obtenerRedencionPorId', () => {
    it('debe retornar una redención si existe', async () => {
      vi.spyOn(redencionRepository, 'obtenerRedencionPorId').mockResolvedValue({
        id: 1,
        usuario_id: 1
      });

      const resultado = await redencionService.obtenerRedencionPorId(1);

      expect(redencionRepository.obtenerRedencionPorId).toHaveBeenCalledWith(1);
      expect(resultado.id).toBe(1);
    });

    it('debe lanzar error si el id no es válido', async () => {
      await expect(redencionService.obtenerRedencionPorId('abc')).rejects.toThrow(
        'El id de la redención no es válido'
      );
    });

    it('debe lanzar error si la redención no existe', async () => {
      vi.spyOn(redencionRepository, 'obtenerRedencionPorId').mockResolvedValue(null);

      await expect(redencionService.obtenerRedencionPorId(999)).rejects.toThrow(
        'Redención no encontrada'
      );
    });
  });
});