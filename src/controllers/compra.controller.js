const compraService = require('../services/compra.service');

const registrarCompra = async (req, res) => {
  try {
    const compra = await compraService.registrarCompra(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: 'Compra registrada correctamente',
      data: compra
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const listarCompras = async (req, res) => {
  try {
    const compras = await compraService.listarCompras();

    return res.status(200).json({
      ok: true,
      mensaje: 'Lista de compras obtenida correctamente',
      data: compras
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

const obtenerCompraPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await compraService.obtenerCompraPorId(id);

    return res.status(200).json({
      ok: true,
      mensaje: 'Compra encontrada',
      data: compra
    });
  } catch (error) {
    const status = error.message === 'Compra no encontrada' ? 404 : 400;

    return res.status(status).json({
      ok: false,
      mensaje: error.message
    });
  }
};

module.exports = {
  registrarCompra,
  listarCompras,
  obtenerCompraPorId
};