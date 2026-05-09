const redencionService = require('../services/redencion.service');

const registrarRedencion = async (req, res) => {
  try {
    const redencion = await redencionService.registrarRedencion(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: 'Redención registrada correctamente',
      data: redencion
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const listarRedenciones = async (req, res) => {
  try {
    const redenciones = await redencionService.listarRedenciones();

    return res.status(200).json({
      ok: true,
      mensaje: 'Lista de redenciones obtenida correctamente',
      data: redenciones
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const obtenerRedencionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const redencion = await redencionService.obtenerRedencionPorId(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Redención encontrada',
      data: redencion
    });
  } catch (error) {
    const status = error.message === 'Redención no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  registrarRedencion,
  listarRedenciones,
  obtenerRedencionPorId
};