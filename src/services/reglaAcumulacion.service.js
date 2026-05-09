const reglaAcumulacionRepository = require('../repositories/reglaAcumulacion.repository');

const crearReglaAcumulacion = async (data) => {
  const { nombre, descripcion, monto_base, puntos_otorgados, estado } = data;

  if (
  !nombre ||
  monto_base === undefined ||
  monto_base === null ||
  puntos_otorgados === undefined ||
  puntos_otorgados === null
  ) {
  throw new Error('Los campos nombre, monto_base y puntos_otorgados son obligatorios');
  }

  if (isNaN(monto_base) || Number(monto_base) <= 0) {
    throw new Error('El monto_base debe ser un número mayor a 0');
  }

  if (isNaN(puntos_otorgados) || Number(puntos_otorgados) <= 0) {
    throw new Error('Los puntos_otorgados deben ser un número mayor a 0');
  }

  return await reglaAcumulacionRepository.crearReglaAcumulacion({
    nombre,
    descripcion,
    monto_base,
    puntos_otorgados,
    estado: typeof estado === 'boolean' ? estado : true
  });
};

const listarReglasAcumulacion = async () => {
  return await reglaAcumulacionRepository.listarReglasAcumulacion();
};

const obtenerReglaAcumulacionPorId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la regla de acumulación no es válido');
  }

  const regla = await reglaAcumulacionRepository.obtenerReglaAcumulacionPorId(id);

  if (!regla) {
    throw new Error('Regla de acumulación no encontrada');
  }

  return regla;
};

const actualizarReglaAcumulacion = async (id, data) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la regla de acumulación no es válido');
  }

  const reglaExistente = await reglaAcumulacionRepository.obtenerReglaAcumulacionPorId(id);

  if (!reglaExistente) {
    throw new Error('Regla de acumulación no encontrada');
  }

  const nombre = data.nombre ?? reglaExistente.nombre;
  const descripcion = data.descripcion ?? reglaExistente.descripcion;
  const monto_base = data.monto_base ?? reglaExistente.monto_base;
  const puntos_otorgados = data.puntos_otorgados ?? reglaExistente.puntos_otorgados;
  const estado = typeof data.estado === 'boolean' ? data.estado : reglaExistente.estado;

  if (!nombre || !monto_base || !puntos_otorgados) {
    throw new Error('Los campos nombre, monto_base y puntos_otorgados son obligatorios');
  }

  if (isNaN(monto_base) || Number(monto_base) <= 0) {
    throw new Error('El monto_base debe ser un número mayor a 0');
  }

  if (isNaN(puntos_otorgados) || Number(puntos_otorgados) <= 0) {
    throw new Error('Los puntos_otorgados deben ser un número mayor a 0');
  }

  return await reglaAcumulacionRepository.actualizarReglaAcumulacion(id, {
    nombre,
    descripcion,
    monto_base,
    puntos_otorgados,
    estado
  });
};

const cambiarEstadoReglaAcumulacion = async (id, estado) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la regla de acumulación no es válido');
  }

  if (typeof estado !== 'boolean') {
    throw new Error('El campo estado debe ser true o false');
  }

  const reglaExistente = await reglaAcumulacionRepository.obtenerReglaAcumulacionPorId(id);

  if (!reglaExistente) {
    throw new Error('Regla de acumulación no encontrada');
  }

  return await reglaAcumulacionRepository.cambiarEstadoReglaAcumulacion(id, estado);
};

module.exports = {
  crearReglaAcumulacion,
  listarReglasAcumulacion,
  obtenerReglaAcumulacionPorId,
  actualizarReglaAcumulacion,
  cambiarEstadoReglaAcumulacion
};