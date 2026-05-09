const express = require('express');
const router = express.Router();
const reglaRedencionController = require('../controllers/reglaRedencion.controller');

router.post('/', reglaRedencionController.crearReglaRedencion);
router.get('/', reglaRedencionController.listarReglasRedencion);
router.get('/:id', reglaRedencionController.obtenerReglaRedencionPorId);
router.put('/:id', reglaRedencionController.actualizarReglaRedencion);
router.patch('/:id/estado', reglaRedencionController.cambiarEstadoReglaRedencion);

module.exports = router;