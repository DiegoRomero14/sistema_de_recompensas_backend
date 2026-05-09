const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const usuarioRoutes = require('./routes/usuario.routes');
const reglaAcumulacionRoutes = require('./routes/reglaAcumulacion.routes');
const compraRoutes = require('./routes/compra.routes');
const reglaRedencionRoutes = require('./routes/reglaRedencion.routes');
const redencionRoutes = require('./routes/redencion.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const rolRoutes = require('./routes/rol.routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API del sistema de recompensas funcionando correctamente'
  });
});

app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/reglas-acumulacion', reglaAcumulacionRoutes);
app.use('/api/v1/compras', compraRoutes);
app.use('/api/v1/reglas-redencion', reglaRedencionRoutes);
app.use('/api/v1/redenciones', redencionRoutes);
app.use('/api/v1/movimientos', movimientoRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/roles', rolRoutes);

module.exports = app;
