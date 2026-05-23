require('dotenv').config();
const app = require('./app');
const { runMigrations } = require('./config/migrations');

const PORT = process.env.PORT || 3000;

// Ejecutar migraciones antes de iniciar el servidor
runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  });