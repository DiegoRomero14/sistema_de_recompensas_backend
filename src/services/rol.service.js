const rolRepository = require('../repositories/rol.repository');

const NIVELES_VALIDOS = new Set(['completo', 'lectura', 'ninguno']);

const normalizarNombreRol = (nombre) => {
  const nombreNormalizado = String(nombre || '').trim().toUpperCase();

  if (!nombreNormalizado) {
    throw new Error('El nombre del rol es obligatorio');
  }

  if (nombreNormalizado.length > 50) {
    throw new Error('El nombre del rol no puede superar 50 caracteres');
  }

  return nombreNormalizado;
};

const normalizarPermisos = (permisos = {}, plantilla = '') => {
  const permisosBase = rolRepository.obtenerPermisosBase(plantilla);

  rolRepository.MODULOS_PERMISOS.forEach((modulo) => {
    const nivel = permisos[modulo];

    if (nivel === undefined || nivel === null || nivel === '') {
      return;
    }

    const nivelNormalizado = String(nivel).trim().toLowerCase();

    if (!NIVELES_VALIDOS.has(nivelNormalizado)) {
      throw new Error('El nivel de permiso no es valido');
    }

    permisosBase[modulo] = nivelNormalizado;
  });

  return permisosBase;
};

const normalizarUsuariosIds = (usuariosIds = []) => {
  if (!Array.isArray(usuariosIds)) {
    throw new Error('usuarios_ids debe ser una lista');
  }

  return [...new Set(usuariosIds.map(Number))]
    .filter((id) => Number.isInteger(id) && id > 0);
};

const listarRoles = async () => {
  return await rolRepository.listarRoles();
};

const crearRol = async (data = {}) => {
  const nombre = normalizarNombreRol(data.nombre);
  const rolExistente = await rolRepository.obtenerRolPorNombre(nombre);

  if (rolExistente) {
    throw new Error('Ya existe un rol con ese nombre');
  }

  return await rolRepository.crearRol({
    nombre,
    descripcion: data.descripcion,
    permisos: normalizarPermisos(data.permisos, data.plantilla || nombre)
  });
};

const actualizarRol = async (id, data = {}) => {
  if (!id || isNaN(id)) {
    throw new Error('El id del rol no es valido');
  }

  const rol = await rolRepository.obtenerRolPorId(id);

  if (!rol) {
    throw new Error('Rol no encontrado');
  }

  const nombre = data.nombre ? normalizarNombreRol(data.nombre) : undefined;

  if (nombre && nombre !== rol.nombre) {
    const rolExistente = await rolRepository.obtenerRolPorNombre(nombre);

    if (rolExistente && Number(rolExistente.id) !== Number(id)) {
      throw new Error('Ya existe un rol con ese nombre');
    }
  }

  return await rolRepository.actualizarRol(id, {
    nombre,
    descripcion: data.descripcion === undefined ? rol.descripcion : data.descripcion,
    permisos: data.permisos ? normalizarPermisos(data.permisos, nombre || rol.nombre) : undefined
  });
};

const asignarUsuarios = async (id, data = {}) => {
  if (!id || isNaN(id)) {
    throw new Error('El id del rol no es valido');
  }

  const rol = await rolRepository.obtenerRolPorId(id);

  if (!rol) {
    throw new Error('Rol no encontrado');
  }

  const usuariosIds = normalizarUsuariosIds(data.usuarios_ids);

  if (usuariosIds.length === 0) {
    throw new Error('Debe seleccionar al menos un usuario');
  }

  return await rolRepository.asignarUsuarios(id, usuariosIds);
};

module.exports = {
  listarRoles,
  crearRol,
  actualizarRol,
  asignarUsuarios
};
