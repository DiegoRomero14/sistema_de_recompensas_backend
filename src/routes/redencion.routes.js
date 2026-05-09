const express = require('express');
const router = express.Router();
const redencionController = require('../controllers/redencion.controller');

router.post('/', redencionController.registrarRedencion);
router.get('/', redencionController.listarRedenciones);
router.get('/:id', redencionController.obtenerRedencionPorId);

module.exports = router;