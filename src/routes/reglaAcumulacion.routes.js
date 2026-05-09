const express = require('express');
const router = express.Router();
const reglaAcumulacionController = require('../controllers/reglaAcumulacion.controller');

router.post('/', reglaAcumulacionController.crearReglaAcumulacion);
router.get('/', reglaAcumulacionController.listarReglasAcumulacion);
router.get('/:id', reglaAcumulacionController.obtenerReglaAcumulacionPorId);
router.put('/:id', reglaAcumulacionController.actualizarReglaAcumulacion);
router.patch('/:id/estado', reglaAcumulacionController.cambiarEstadoReglaAcumulacion);

module.exports = router;