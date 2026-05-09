const reglaRedencionService = require('../services/reglaRedencion.service');

const crearReglaRedencion = async (req, res) => {
  try {
    const regla = await reglaRedencionService.crearReglaRedencion(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Regla de redención creada correctamente',
      data: regla
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const listarReglasRedencion = async (req, res) => {
  try {
    const reglas = await reglaRedencionService.listarReglasRedencion();
    return res.status(200).json({
      ok: true,
      mensaje: 'Lista de reglas de redención obtenida correctamente',
      data: reglas
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const obtenerReglaRedencionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const regla = await reglaRedencionService.obtenerReglaRedencionPorId(id);
    return res.status(200).json({
      ok: true,
      mensaje: 'Regla de redención encontrada',
      data: regla
    });
  } catch (error) {
    const status =
      error.message === 'Regla de redención no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const actualizarReglaRedencion = async (req, res) => {
  try {
    const { id } = req.params;
    const regla = await reglaRedencionService.actualizarReglaRedencion(
      id,
      req.body
    );

    return res.status(200).json({
      ok: true,
      mensaje: 'Regla de redención actualizada correctamente',
      data: regla
    });
  } catch (error) {
    const status =
      error.message === 'Regla de redención no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const cambiarEstadoReglaRedencion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const regla = await reglaRedencionService.cambiarEstadoReglaRedencion(
      id,
      estado
    );

    return res.status(200).json({
      ok: true,
      mensaje: 'Estado de la regla de redención actualizado correctamente',
      data: regla
    });
  } catch (error) {
    const status =
      error.message === 'Regla de redención no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  crearReglaRedencion,
  listarReglasRedencion,
  obtenerReglaRedencionPorId,
  actualizarReglaRedencion,
  cambiarEstadoReglaRedencion
};