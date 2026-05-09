const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compra.controller');

router.post('/', compraController.registrarCompra);
router.get('/', compraController.listarCompras);
router.get('/:id', compraController.obtenerCompraPorId);

module.exports = router;