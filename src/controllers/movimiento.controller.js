const movimientoService = require('../services/movimiento.service');

const listarMovimientos = async (req, res) => {
  try {
    const movimientos = await movimientoService.listarMovimientos(req.query);

    return res.status(200).json({
      ok: true,
      mensaje: 'Lista de movimientos obtenida correctamente',
      data: movimientos
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const obtenerMovimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const movimiento = await movimientoService.obtenerMovimientoPorId(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Movimiento encontrado',
      data: movimiento
    });
  } catch (error) {
    const status = error.message === 'Movimiento no encontrado' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const listarMovimientosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const movimientos = await movimientoService.listarMovimientosPorUsuario(usuarioId);

    return res.status(200).json({
      ok: true,
      mensaje: 'Movimientos del usuario obtenidos correctamente',
      data: movimientos
    });
  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  listarMovimientos,
  obtenerMovimientoPorId,
  listarMovimientosPorUsuario
};
