const usuarioService = require('../services/usuario.service');

const registrarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.registrarUsuario(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente',
      data: usuario
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const iniciarSesion = async (req, res) => {
  try {
    const sesion = await usuarioService.iniciarSesion(req.body);

    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesion correcto',
      data: sesion
    });
  } catch (error) {
    const status =
      error.message === 'Credenciales invalidas'
        ? 401
        : error.message === 'Usuario inactivo'
          ? 403
          : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario creado correctamente',
      data: usuario
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.listarUsuarios(req.query);

    return res.status(200).json({
      ok: true,
      mensaje: 'Lista de usuarios obtenida correctamente',
      data: usuarios
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.obtenerUsuarioPorId(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Usuario encontrado',
      data: usuario
    });
  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const usuario = await usuarioService.cambiarEstadoUsuario(id, estado);

    return res.status(200).json({
      ok: true,
      mensaje: 'Estado del usuario actualizado correctamente',
      data: usuario
    });
  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const obtenerSaldoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const saldo = await usuarioService.obtenerSaldoUsuario(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Saldo obtenido correctamente',
      data: saldo
    });
  } catch (error) {
    const status =
      error.message === 'Usuario no encontrado' || error.message === 'Saldo no encontrado'
        ? 404
        : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  cambiarEstadoUsuario,
  obtenerSaldoUsuario
};
