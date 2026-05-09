const reglaRedencionRepository = require('../../src/repositories/reglaRedencion.repository');
const reglaRedencionService = require('../../src/services/reglaRedencion.service');

describe('Pruebas unitarias - reglaRedencion.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('crearReglaRedencion', () => {
    it('debe crear una regla de redención correctamente', async () => {
      const data = {
        nombre: 'Redención básica',
        descripcion: '100 puntos por 10000 pesos',
        puntos_requeridos: 100,
        valor_equivalente: 10000,
        estado: true
      };

      vi.spyOn(reglaRedencionRepository, 'crearReglaRedencion').mockResolvedValue({
        id: 1,
        ...data
      });

      const resultado = await reglaRedencionService.crearReglaRedencion(data);

      expect(reglaRedencionRepository.crearReglaRedencion).toHaveBeenCalled();
      expect(resultado.nombre).toBe('Redención básica');
      expect(resultado.puntos_requeridos).toBe(100);
    });

    it('debe lanzar error si faltan campos obligatorios', async () => {
      const data = {
        nombre: '',
        puntos_requeridos: undefined,
        valor_equivalente: undefined
      };

      await expect(reglaRedencionService.crearReglaRedencion(data)).rejects.toThrow(
        'Los campos nombre, puntos_requeridos y valor_equivalente son obligatorios'
      );
    });

    it('debe lanzar error si puntos_requeridos no es válido', async () => {
      const data = {
        nombre: 'Redención inválida',
        puntos_requeridos: 0,
        valor_equivalente: 5000
      };

      await expect(reglaRedencionService.crearReglaRedencion(data)).rejects.toThrow(
        'El puntos_requeridos debe ser un número mayor a 0'
      );
    });

    it('debe lanzar error si valor_equivalente no es válido', async () => {
      const data = {
        nombre: 'Redención inválida',
        puntos_requeridos: 100,
        valor_equivalente: -1
      };

      await expect(reglaRedencionService.crearReglaRedencion(data)).rejects.toThrow(
        'El valor_equivalente debe ser un número mayor o igual a 0'
      );
    });
  });

  describe('listarReglasRedencion', () => {
    it('debe retornar la lista de reglas de redención', async () => {
      const reglasMock = [
        { id: 1, nombre: 'Regla 1' },
        { id: 2, nombre: 'Regla 2' }
      ];

      vi.spyOn(reglaRedencionRepository, 'listarReglasRedencion').mockResolvedValue(reglasMock);

      const resultado = await reglaRedencionService.listarReglasRedencion();

      expect(reglaRedencionRepository.listarReglasRedencion).toHaveBeenCalled();
      expect(resultado).toHaveLength(2);
    });
  });

  describe('obtenerReglaRedencionPorId', () => {
    it('debe retornar una regla si existe', async () => {
      const reglaMock = { id: 1, nombre: 'Redención básica' };

      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue(reglaMock);

      const resultado = await reglaRedencionService.obtenerReglaRedencionPorId(1);

      expect(reglaRedencionRepository.obtenerReglaRedencionPorId).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(reglaMock);
    });

    it('debe lanzar error si el id no es válido', async () => {
      await expect(reglaRedencionService.obtenerReglaRedencionPorId('abc')).rejects.toThrow(
        'El id de la regla de redención no es válido'
      );
    });

    it('debe lanzar error si la regla no existe', async () => {
      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue(null);

      await expect(reglaRedencionService.obtenerReglaRedencionPorId(999)).rejects.toThrow(
        'Regla de redención no encontrada'
      );
    });
  });

  describe('actualizarReglaRedencion', () => {
    it('debe actualizar una regla correctamente', async () => {
      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Redención básica',
        descripcion: 'Anterior',
        puntos_requeridos: 100,
        valor_equivalente: 10000,
        estado: true
      });

      vi.spyOn(reglaRedencionRepository, 'actualizarReglaRedencion').mockResolvedValue({
        id: 1,
        nombre: 'Redención premium',
        descripcion: 'Actualizada',
        puntos_requeridos: 200,
        valor_equivalente: 20000,
        estado: true
      });

      const resultado = await reglaRedencionService.actualizarReglaRedencion(1, {
        nombre: 'Redención premium',
        descripcion: 'Actualizada',
        puntos_requeridos: 200,
        valor_equivalente: 20000
      });

      expect(reglaRedencionRepository.obtenerReglaRedencionPorId).toHaveBeenCalledWith(1);
      expect(reglaRedencionRepository.actualizarReglaRedencion).toHaveBeenCalled();
      expect(resultado.nombre).toBe('Redención premium');
    });

    it('debe lanzar error si la regla no existe', async () => {
      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue(null);

      await expect(
        reglaRedencionService.actualizarReglaRedencion(99, {
          nombre: 'Nueva',
          puntos_requeridos: 100,
          valor_equivalente: 5000
        })
      ).rejects.toThrow('Regla de redención no encontrada');
    });
  });

  describe('cambiarEstadoReglaRedencion', () => {
    it('debe cambiar el estado correctamente', async () => {
      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Redención básica',
        estado: true
      });

      vi.spyOn(reglaRedencionRepository, 'cambiarEstadoReglaRedencion').mockResolvedValue({
        id: 1,
        nombre: 'Redención básica',
        estado: false
      });

      const resultado = await reglaRedencionService.cambiarEstadoReglaRedencion(1, false);

      expect(reglaRedencionRepository.obtenerReglaRedencionPorId).toHaveBeenCalledWith(1);
      expect(reglaRedencionRepository.cambiarEstadoReglaRedencion).toHaveBeenCalledWith(1, false);
      expect(resultado.estado).toBe(false);
    });

    it('debe lanzar error si estado no es boolean', async () => {
      await expect(
        reglaRedencionService.cambiarEstadoReglaRedencion(1, 'false')
      ).rejects.toThrow('El campo estado debe ser true o false');
    });

    it('debe lanzar error si la regla no existe', async () => {
      vi.spyOn(reglaRedencionRepository, 'obtenerReglaRedencionPorId').mockResolvedValue(null);

      await expect(
        reglaRedencionService.cambiarEstadoReglaRedencion(999, false)
      ).rejects.toThrow('Regla de redención no encontrada');
    });
  });
});