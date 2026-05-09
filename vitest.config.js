const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html','lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/controllers/usuario.controller.js',
        'src/services/usuario.service.js',
        'src/routes/usuario.routes.js',
        'src/repositories/usuario.repository.js',

        'src/controllers/reglaAcumulacion.controller.js',
        'src/services/reglaAcumulacion.service.js',
        'src/routes/reglaAcumulacion.routes.js',
        'src/repositories/reglaAcumulacion.repository.js',

        'src/controllers/compra.controller.js',
        'src/services/compra.service.js',
        'src/routes/compra.routes.js',
        'src/repositories/compra.repository.js',

        'src/controllers/reglaRedencion.controller.js',
        'src/services/reglaRedencion.service.js',
        'src/routes/reglaRedencion.routes.js',
        'src/repositories/reglaRedencion.repository.js',

        'src/controllers/redencion.controller.js',
        'src/services/redencion.service.js',
        'src/routes/redencion.routes.js',
        'src/repositories/redencion.repository.js',

        'src/controllers/movimiento.controller.js',
        'src/services/movimiento.service.js',
        'src/routes/movimiento.routes.js',
        'src/repositories/movimiento.repository.js'
      ]
    }
  }
});