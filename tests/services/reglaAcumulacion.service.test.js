const reglaAcumulacionRepository = require('../../src/repositories/reglaAcumulacion.repository');
const reglaAcumulacionService = require('../../src/services/reglaAcumulacion.service');

describe('Pruebas unitarias - reglaAcumulacion.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('crearReglaAcumulacion', () => {
    it('debe crear una regla de acumulación correctamente', async () => {
      const data = {
        nombre: 'Regla básica',
        descripcion: 'Por cada 1000 pesos gana 1 punto',
        monto_base: 1000,
        puntos_otorgados: 1,
        estado: true
      };

      vi.spyOn(reglaAcumulacionRepository, 'crearReglaAcumulacion').mockResolvedValue({
        id: 1,
        ...data
      });

      const resultado = await reglaAcumulacionService.crearReglaAcumulacion(data);

      expect(reglaAcumulacionRepository.crearReglaAcumulacion).toHaveBeenCalled();
      expect(resultado.nombre).toBe('Regla básica');
      expect(resultado.monto_base).toBe(1000);
    });

    it('debe lanzar error si faltan campos obligatorios', async () => {
      const data = {
        nombre: '',
        monto_base: '',
        puntos_otorgados: ''
      };

      await expect(reglaAcumulacionService.crearReglaAcumulacion(data)).rejects.toThrow(
        'Los campos nombre, monto_base y puntos_otorgados son obligatorios'
      );
    });

    it('debe lanzar error si monto_base no es válido', async () => {
      const data = {
        nombre: 'Regla inválida',
        monto_base: 0,
        puntos_otorgados: 1
      };

      await expect(reglaAcumulacionService.crearReglaAcumulacion(data)).rejects.toThrow(
        'El monto_base debe ser un número mayor a 0'
      );
    });

    it('debe lanzar error si puntos_otorgados no es válido', async () => {
      const data = {
        nombre: 'Regla inválida',
        monto_base: 1000,
        puntos_otorgados: 0
      };

      await expect(reglaAcumulacionService.crearReglaAcumulacion(data)).rejects.toThrow(
        'Los puntos_otorgados deben ser un número mayor a 0'
      );
    });
  });

  describe('listarReglasAcumulacion', () => {
    it('debe retornar la lista de reglas', async () => {
      const reglasMock = [
        { id: 1, nombre: 'Regla 1' },
        { id: 2, nombre: 'Regla 2' }
      ];

      vi.spyOn(reglaAcumulacionRepository, 'listarReglasAcumulacion').mockResolvedValue(reglasMock);

      const resultado = await reglaAcumulacionService.listarReglasAcumulacion();

      expect(reglaAcumulacionRepository.listarReglasAcumulacion).toHaveBeenCalled();
      expect(resultado).toHaveLength(2);
    });
  });

  describe('obtenerReglaAcumulacionPorId', () => {
    it('debe retornar una regla si existe', async () => {
      const reglaMock = { id: 1, nombre: 'Regla básica' };

      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaAcumulacionPorId').mockResolvedValue(reglaMock);

      const resultado = await reglaAcumulacionService.obtenerReglaAcumulacionPorId(1);

      expect(reglaAcumulacionRepository.obtenerReglaAcumulacionPorId).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(reglaMock);
    });

    it('debe lanzar error si el id no es válido', async () => {
      await expect(reglaAcumulacionService.obtenerReglaAcumulacionPorId('abc')).rejects.toThrow(
        'El id de la regla de acumulación no es válido'
      );
    });

    it('debe lanzar error si no existe la regla', async () => {
      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaAcumulacionPorId').mockResolvedValue(null);

      await expect(reglaAcumulacionService.obtenerReglaAcumulacionPorId(999)).rejects.toThrow(
        'Regla de acumulación no encontrada'
      );
    });
  });

  describe('actualizarReglaAcumulacion', () => {
    it('debe actualizar una regla correctamente', async () => {
      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaAcumulacionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Regla básica',
        descripcion: 'Anterior',
        monto_base: 1000,
        puntos_otorgados: 1,
        estado: true
      });

      vi.spyOn(reglaAcumulacionRepository, 'actualizarReglaAcumulacion').mockResolvedValue({
        id: 1,
        nombre: 'Regla premium',
        descripcion: 'Actualizada',
        monto_base: 2000,
        puntos_otorgados: 2,
        estado: true
      });

      const resultado = await reglaAcumulacionService.actualizarReglaAcumulacion(1, {
        nombre: 'Regla premium',
        descripcion: 'Actualizada',
        monto_base: 2000,
        puntos_otorgados: 2
      });

      expect(reglaAcumulacionRepository.obtenerReglaAcumulacionPorId).toHaveBeenCalledWith(1);
      expect(reglaAcumulacionRepository.actualizarReglaAcumulacion).toHaveBeenCalled();
      expect(resultado.nombre).toBe('Regla premium');
    });

    it('debe lanzar error si la regla no existe', async () => {
      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaAcumulacionPorId').mockResolvedValue(null);

      await expect(
        reglaAcumulacionService.actualizarReglaAcumulacion(99, {
          nombre: 'Nueva',
          monto_base: 1000,
          puntos_otorgados: 1
        })
      ).rejects.toThrow('Regla de acumulación no encontrada');
    });
  });

  describe('cambiarEstadoReglaAcumulacion', () => {
    it('debe cambiar el estado correctamente', async () => {
      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaAcumulacionPorId').mockResolvedValue({
        id: 1,
        nombre: 'Regla básica',
        estado: true
      });

      vi.spyOn(reglaAcumulacionRepository, 'cambiarEstadoReglaAcumulacion').mockResolvedValue({
        id: 1,
        nombre: 'Regla básica',
        estado: false
      });

      const resultado = await reglaAcumulacionService.cambiarEstadoReglaAcumulacion(1, false);

      expect(reglaAcumulacionRepository.obtenerReglaAcumulacionPorId).toHaveBeenCalledWith(1);
      expect(reglaAcumulacionRepository.cambiarEstadoReglaAcumulacion).toHaveBeenCalledWith(1, false);
      expect(resultado.estado).toBe(false);
    });

    it('debe lanzar error si estado no es boolean', async () => {
      await expect(
        reglaAcumulacionService.cambiarEstadoReglaAcumulacion(1, 'false')
      ).rejects.toThrow('El campo estado debe ser true o false');
    });

    it('debe lanzar error si la regla no existe', async () => {
      vi.spyOn(reglaAcumulacionRepository, 'obtenerReglaAcumulacionPorId').mockResolvedValue(null);

      await expect(
        reglaAcumulacionService.cambiarEstadoReglaAcumulacion(999, false)
      ).rejects.toThrow('Regla de acumulación no encontrada');
    });
  });
});