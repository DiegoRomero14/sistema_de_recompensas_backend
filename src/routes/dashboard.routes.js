const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/admin', dashboardController.obtenerResumenAdmin);

module.exports = router;
