const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimiento.controller');

router.get('/', movimientoController.listarMovimientos);
router.get('/usuario/:usuarioId', movimientoController.listarMovimientosPorUsuario);
router.get('/:id', movimientoController.obtenerMovimientoPorId);

module.exports = router;