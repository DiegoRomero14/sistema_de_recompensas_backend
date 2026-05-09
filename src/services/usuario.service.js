const usuarioRepository = require('../repositories/usuario.repository');
const {
  generarHashContrasena,
  generarTokenSesion,
  validarContrasena
} = require('../utils/password');

const sanitizarUsuario = (usuario) => {
  const { contrasena_hash, ...usuarioPublico } = usuario;
  return usuarioPublico;
};

const ROLES_VALIDOS = new Set(['administrador', 'operador', 'consulta']);

const normalizarRol = (rol) => {
  const rolNormalizado =
    typeof rol === 'string' && rol.trim() ? rol.trim().toLowerCase() : 'administrador';

  if (!ROLES_VALIDOS.has(rolNormalizado)) {
    throw new Error('El rol del usuario no es valido');
  }

  return rolNormalizado;
};

const crearUsuario = async (data = {}) => {
  const { tipo_documento, numero_documento, nombre, correo, telefono, rol } = data;

  if (!tipo_documento || !numero_documento || !nombre) {
    throw new Error('Los campos tipo_documento, numero_documento y nombre son obligatorios');
  }

  const rolUsuario = normalizarRol(rol);
  const usuarioExistente = await usuarioRepository.buscarPorNumeroDocumento(numero_documento);

  if (usuarioExistente) {
    throw new Error('Ya existe un usuario con ese número de documento');
  }

  if (correo) {
    const correoExistente = await usuarioRepository.buscarPorCorreo(correo);
    if (correoExistente) {
      throw new Error('Ya existe un usuario con ese correo');
    }
  }

  const nuevoUsuario = await usuarioRepository.crearUsuario({
    tipo_documento,
    numero_documento,
    nombre,
    correo,
    telefono,
    rol: rolUsuario
  });

  await usuarioRepository.crearSaldoInicial(nuevoUsuario.id);

  return nuevoUsuario;
};

const registrarUsuario = async (data = {}) => {
  const { tipo_documento, numero_documento, nombre, correo, telefono, rol, contrasena } = data;

  if (
    !tipo_documento ||
    !numero_documento ||
    !nombre ||
    !correo ||
    typeof contrasena !== 'string' ||
    !contrasena
  ) {
    throw new Error(
      'Los campos tipo_documento, numero_documento, nombre, correo y contrasena son obligatorios'
    );
  }

  if (contrasena.length < 6) {
    throw new Error('La contrasena debe tener al menos 6 caracteres');
  }

  const rolUsuario = normalizarRol(rol);
  const usuarioExistente = await usuarioRepository.buscarPorNumeroDocumento(numero_documento);

  if (usuarioExistente) {
    throw new Error('Ya existe un usuario con ese numero de documento');
  }

  const correoExistente = await usuarioRepository.buscarPorCorreo(correo);

  if (correoExistente) {
    throw new Error('Ya existe un usuario con ese correo');
  }

  const nuevoUsuario = await usuarioRepository.crearUsuario({
    tipo_documento,
    numero_documento,
    nombre,
    correo,
    telefono,
    rol: rolUsuario,
    contrasena_hash: generarHashContrasena(contrasena)
  });

  await usuarioRepository.crearSaldoInicial(nuevoUsuario.id);

  return nuevoUsuario;
};

const iniciarSesion = async (data = {}) => {
  const { correo, numero_documento, contrasena } = data;

  if ((!correo && !numero_documento) || typeof contrasena !== 'string' || !contrasena) {
    throw new Error('El correo o numero_documento y la contrasena son obligatorios');
  }

  const usuario = correo
    ? await usuarioRepository.buscarPorCorreo(correo)
    : await usuarioRepository.buscarPorNumeroDocumento(numero_documento);

  if (!usuario || !validarContrasena(contrasena, usuario.contrasena_hash)) {
    throw new Error('Credenciales invalidas');
  }

  if (usuario.estado === false) {
    throw new Error('Usuario inactivo');
  }

  return {
    usuario: sanitizarUsuario(usuario),
    token: generarTokenSesion()
  };
};

const normalizarEstadoFiltro = (estado) => {
  if (estado === undefined || estado === null || estado === '') {
    return undefined;
  }

  const estadoNormalizado = String(estado).trim().toLowerCase();

  if (['true', 'activo', 'activos', '1'].includes(estadoNormalizado)) {
    return true;
  }

  if (['false', 'inactivo', 'inactivos', '0'].includes(estadoNormalizado)) {
    return false;
  }

  return undefined;
};

const normalizarFiltrosUsuarios = (filtros = {}) => ({
  buscar: filtros.buscar || filtros.q || '',
  tipo_documento: filtros.tipo_documento || '',
  estado: normalizarEstadoFiltro(filtros.estado)
});

const listarUsuarios = async (filtros = {}) => {
  return await usuarioRepository.listarUsuarios(normalizarFiltrosUsuarios(filtros));
};

const obtenerUsuarioPorId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error('El id del usuario no es válido');
  }

  const usuario = await usuarioRepository.obtenerUsuarioPorId(id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  return usuario;
};

const cambiarEstadoUsuario = async (id, estado) => {
  if (!id || isNaN(id)) {
    throw new Error('El id del usuario no es válido');
  }

  if (typeof estado !== 'boolean') {
    throw new Error('El campo estado debe ser true o false');
  }

  const usuario = await usuarioRepository.obtenerUsuarioPorId(id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  return await usuarioRepository.actualizarEstadoUsuario(id, estado);
};

const obtenerSaldoUsuario = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error('El id del usuario no es válido');
  }

  const usuario = await usuarioRepository.obtenerUsuarioPorId(id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const saldo = await usuarioRepository.obtenerSaldoUsuario(id);

  if (!saldo) {
    throw new Error('Saldo no encontrado');
  }

  return saldo;
};

module.exports = {
  crearUsuario,
  registrarUsuario,
  iniciarSesion,
  listarUsuarios,
  obtenerUsuarioPorId,
  cambiarEstadoUsuario,
  obtenerSaldoUsuario
};
