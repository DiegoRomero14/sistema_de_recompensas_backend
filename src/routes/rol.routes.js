const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rol.controller');

router.get('/', rolController.listarRoles);
router.post('/', rolController.crearRol);
router.put('/:id', rolController.actualizarRol);
router.post('/:id/usuarios', rolController.asignarUsuarios);

module.exports = router;
