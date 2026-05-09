const dashboardService = require('../services/dashboard.service');

const obtenerResumenAdmin = async (req, res) => {
  try {
    const resumen = await dashboardService.obtenerResumenAdmin();

    return res.status(200).json({
      ok: true,
      mensaje: 'Resumen del dashboard obtenido correctamente',
      data: resumen
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  obtenerResumenAdmin
};
