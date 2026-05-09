const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

router.post('/registro', usuarioController.registrarUsuario);
router.post('/login', usuarioController.iniciarSesion);
router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.listarUsuarios);
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.patch('/:id/estado', usuarioController.cambiarEstadoUsuario);
router.get('/:id/saldo', usuarioController.obtenerSaldoUsuario);

module.exports = router;
