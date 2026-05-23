const pool = require('./db');

const initSQL = `
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  tipo_documento VARCHAR(20) NOT NULL,
  numero_documento VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) UNIQUE,
  telefono VARCHAR(50),
  contrasena_hash VARCHAR(255),
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS contrasena_hash VARCHAR(255);

CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_nombre_unique
ON roles(nombre);

INSERT INTO roles (nombre, descripcion)
SELECT 'ADMINISTRADOR', 'Gestiona configuracion y reglas del sistema'
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE nombre = 'ADMINISTRADOR'
);

INSERT INTO roles (nombre, descripcion)
SELECT 'OPERADOR', 'Registra compras y redenciones'
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE nombre = 'OPERADOR'
);

INSERT INTO roles (nombre, descripcion)
SELECT 'CONSULTA', 'Solo consulta informacion y reportes'
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE nombre = 'CONSULTA'
);

CREATE TABLE IF NOT EXISTS usuarios_roles (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (usuario_id, rol_id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario_id
ON usuarios_roles(usuario_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol_id
ON usuarios_roles(rol_id);

CREATE TABLE IF NOT EXISTS roles_permisos (
  id BIGSERIAL PRIMARY KEY,
  rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  modulo VARCHAR(50) NOT NULL,
  nivel VARCHAR(20) NOT NULL DEFAULT 'ninguno',
  UNIQUE (rol_id, modulo)
);

INSERT INTO usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u
INNER JOIN roles r ON r.nombre = 'ADMINISTRADOR'
WHERE NOT EXISTS (
  SELECT 1
  FROM usuarios_roles ur
  WHERE ur.usuario_id = u.id
);

CREATE TABLE IF NOT EXISTS saldos_puntos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  saldo_actual INTEGER NOT NULL DEFAULT 0,
  ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reglas_acumulacion (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  monto_base NUMERIC(12, 2) NOT NULL,
  puntos_otorgados INTEGER NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reglas_redencion (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  puntos_requeridos INTEGER NOT NULL,
  valor_equivalente NUMERIC(12, 2) NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compras (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  valor_compra NUMERIC(12, 2) NOT NULL,
  origen VARCHAR(50) NOT NULL,
  observacion TEXT,
  fecha_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS redenciones (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  regla_redencion_id BIGINT NOT NULL REFERENCES reglas_redencion(id) ON DELETE RESTRICT,
  puntos_usados INTEGER NOT NULL,
  valor_redimido NUMERIC(12, 2) NOT NULL,
  codigo_unico VARCHAR(120) NOT NULL UNIQUE,
  observacion TEXT,
  fecha_redencion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movimientos_puntos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_movimiento VARCHAR(30) NOT NULL,
  puntos INTEGER NOT NULL,
  descripcion TEXT,
  origen VARCHAR(50),
  referencia_id BIGINT,
  fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auditoria (
  id BIGSERIAL PRIMARY KEY,
  entidad VARCHAR(80) NOT NULL,
  entidad_id BIGINT NOT NULL,
  accion VARCHAR(30) NOT NULL,
  detalle TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones de base de datos...');
    await pool.query(initSQL);
    console.log('✅ Migraciones completadas exitosamente');
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    throw error;
  }
}

module.exports = { runMigrations };
