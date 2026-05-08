const rolService = require('../services/rol.service');

const listarRoles = async (req, res) => {
  try {
    const roles = await rolService.listarRoles();

    return res.status(200).json({
      ok: true,
      mensaje: 'Roles obtenidos correctamente',
      data: roles
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const crearRol = async (req, res) => {
  try {
    const roles = await rolService.crearRol(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: 'Rol creado correctamente',
      data: roles
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const actualizarRol = async (req, res) => {
  try {
    const roles = await rolService.actualizarRol(req.params.id, req.body);

    return res.status(200).json({
      ok: true,
      mensaje: 'Rol actualizado correctamente',
      data: roles
    });
  } catch (error) {
    const status = error.message === 'Rol no encontrado' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const asignarUsuarios = async (req, res) => {
  try {
    const roles = await rolService.asignarUsuarios(req.params.id, req.body);

    return res.status(200).json({
      ok: true,
      mensaje: 'Usuarios asignados correctamente',
      data: roles
    });
  } catch (error) {
    const status = error.message === 'Rol no encontrado' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  listarRoles,
  crearRol,
  actualizarRol,
  asignarUsuarios
};
