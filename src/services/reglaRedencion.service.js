const reglaRedencionRepository = require('../repositories/reglaRedencion.repository');

const crearReglaRedencion = async (data) => {
  const {
    nombre,
    descripcion,
    puntos_requeridos,
    valor_equivalente,
    estado
  } = data;

  if (
    !nombre ||
    puntos_requeridos === undefined ||
    valor_equivalente === undefined
  ) {
    throw new Error(
      'Los campos nombre, puntos_requeridos y valor_equivalente son obligatorios'
    );
  }

  if (isNaN(puntos_requeridos) || Number(puntos_requeridos) <= 0) {
    throw new Error('El puntos_requeridos debe ser un número mayor a 0');
  }

  if (isNaN(valor_equivalente) || Number(valor_equivalente) < 0) {
    throw new Error('El valor_equivalente debe ser un número mayor o igual a 0');
  }

  return await reglaRedencionRepository.crearReglaRedencion({
    nombre,
    descripcion,
    puntos_requeridos: Number(puntos_requeridos),
    valor_equivalente: Number(valor_equivalente),
    estado: typeof estado === 'boolean' ? estado : true
  });
};

const listarReglasRedencion = async () => {
  return await reglaRedencionRepository.listarReglasRedencion();
};

const obtenerReglaRedencionPorId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la regla de redención no es válido');
  }

  const regla = await reglaRedencionRepository.obtenerReglaRedencionPorId(id);

  if (!regla) {
    throw new Error('Regla de redención no encontrada');
  }

  return regla;
};

const actualizarReglaRedencion = async (id, data) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la regla de redención no es válido');
  }

  const reglaExistente =
    await reglaRedencionRepository.obtenerReglaRedencionPorId(id);

  if (!reglaExistente) {
    throw new Error('Regla de redención no encontrada');
  }

  const nombre = data.nombre ?? reglaExistente.nombre;
  const descripcion = data.descripcion ?? reglaExistente.descripcion;
  const puntos_requeridos =
    data.puntos_requeridos ?? reglaExistente.puntos_requeridos;
  const valor_equivalente =
    data.valor_equivalente ?? reglaExistente.valor_equivalente;
  const estado =
    typeof data.estado === 'boolean' ? data.estado : reglaExistente.estado;

  if (
    !nombre ||
    puntos_requeridos === undefined ||
    valor_equivalente === undefined
  ) {
    throw new Error(
      'Los campos nombre, puntos_requeridos y valor_equivalente son obligatorios'
    );
  }

  if (isNaN(puntos_requeridos) || Number(puntos_requeridos) <= 0) {
    throw new Error('El puntos_requeridos debe ser un número mayor a 0');
  }

  if (isNaN(valor_equivalente) || Number(valor_equivalente) < 0) {
    throw new Error('El valor_equivalente debe ser un número mayor o igual a 0');
  }

  return await reglaRedencionRepository.actualizarReglaRedencion(id, {
    nombre,
    descripcion,
    puntos_requeridos: Number(puntos_requeridos),
    valor_equivalente: Number(valor_equivalente),
    estado
  });
};

const cambiarEstadoReglaRedencion = async (id, estado) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la regla de redención no es válido');
  }

  if (typeof estado !== 'boolean') {
    throw new Error('El campo estado debe ser true o false');
  }

  const reglaExistente =
    await reglaRedencionRepository.obtenerReglaRedencionPorId(id);

  if (!reglaExistente) {
    throw new Error('Regla de redención no encontrada');
  }

  return await reglaRedencionRepository.cambiarEstadoReglaRedencion(id, estado);
};

module.exports = {
  crearReglaRedencion,
  listarReglasRedencion,
  obtenerReglaRedencionPorId,
  actualizarReglaRedencion,
  cambiarEstadoReglaRedencion
};