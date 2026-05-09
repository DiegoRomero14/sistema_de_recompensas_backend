const reglaAcumulacionService = require('../services/reglaAcumulacion.service');

const crearReglaAcumulacion = async (req, res) => {
  try {
    const regla = await reglaAcumulacionService.crearReglaAcumulacion(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: 'Regla de acumulación creada correctamente',
      data: regla
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const listarReglasAcumulacion = async (req, res) => {
  try {
    const reglas = await reglaAcumulacionService.listarReglasAcumulacion();

    return res.status(200).json({
      ok: true,
      mensaje: 'Lista de reglas de acumulación obtenida correctamente',
      data: reglas
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const obtenerReglaAcumulacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const regla = await reglaAcumulacionService.obtenerReglaAcumulacionPorId(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Regla de acumulación encontrada',
      data: regla
    });
  } catch (error) {
    const status = error.message === 'Regla de acumulación no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const actualizarReglaAcumulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const regla = await reglaAcumulacionService.actualizarReglaAcumulacion(id, req.body);

    return res.status(200).json({
      ok: true,
      mensaje: 'Regla de acumulación actualizada correctamente',
      data: regla
    });
  } catch (error) {
    const status = error.message === 'Regla de acumulación no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const cambiarEstadoReglaAcumulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const regla = await reglaAcumulacionService.cambiarEstadoReglaAcumulacion(id, estado);

    return res.status(200).json({
      ok: true,
      mensaje: 'Estado de la regla de acumulación actualizado correctamente',
      data: regla
    });
  } catch (error) {
    const status = error.message === 'Regla de acumulación no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  crearReglaAcumulacion,
  listarReglasAcumulacion,
  obtenerReglaAcumulacionPorId,
  actualizarReglaAcumulacion,
  cambiarEstadoReglaAcumulacion
};