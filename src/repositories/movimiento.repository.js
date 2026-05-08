const pool = require('../config/db');

const listarMovimientos = async (filtros = {}) => {
  const condiciones = [];
  const valores = [];

  if (filtros.buscar) {
    valores.push(`%${String(filtros.buscar).trim()}%`);
    condiciones.push(`(
      u.nombre ILIKE $${valores.length}
      OR u.numero_documento ILIKE $${valores.length}
      OR m.origen ILIKE $${valores.length}
      OR m.descripcion ILIKE $${valores.length}
      OR m.id::text ILIKE $${valores.length}
      OR m.referencia_id::text ILIKE $${valores.length}
    )`);
  }

  if (filtros.tipo_movimiento) {
    valores.push(String(filtros.tipo_movimiento).trim().toUpperCase());
    condiciones.push(`m.tipo_movimiento = $${valores.length}`);
  }

  if (filtros.origen) {
    valores.push(String(filtros.origen).trim());
    condiciones.push(`COALESCE(NULLIF(TRIM(m.origen), ''), 'Sin origen') = $${valores.length}`);
  }

  if (filtros.usuario_id && !isNaN(filtros.usuario_id)) {
    valores.push(Number(filtros.usuario_id));
    condiciones.push(`m.usuario_id = $${valores.length}`);
  }

  if (filtros.fecha_desde) {
    valores.push(String(filtros.fecha_desde));
    condiciones.push(`m.fecha_movimiento::date >= $${valores.length}::date`);
  }

  if (filtros.fecha_hasta) {
    valores.push(String(filtros.fecha_hasta));
    condiciones.push(`m.fecha_movimiento::date <= $${valores.length}::date`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  const query = `
    SELECT
      m.id,
      m.usuario_id,
      u.nombre AS usuario_nombre,
      u.numero_documento,
      m.tipo_movimiento,
      m.puntos,
      m.descripcion,
      COALESCE(NULLIF(TRIM(m.origen), ''), 'Sin origen') AS origen,
      m.referencia_id,
      m.fecha_movimiento
    FROM movimientos_puntos m
    INNER JOIN usuarios u ON u.id = m.usuario_id
    ${where}
    ORDER BY m.id DESC;
  `;

  const { rows } = await pool.query(query, valores);
  return rows;
};

const obtenerMovimientoPorId = async (id) => {
  const query = `
    SELECT
      m.id,
      m.usuario_id,
      u.nombre AS usuario_nombre,
      u.numero_documento,
      m.tipo_movimiento,
      m.puntos,
      m.descripcion,
      m.origen,
      m.referencia_id,
      m.fecha_movimiento
    FROM movimientos_puntos m
    INNER JOIN usuarios u ON u.id = m.usuario_id
    WHERE m.id = $1;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const listarMovimientosPorUsuario = async (usuarioId) => {
  const query = `
    SELECT
      m.id,
      m.usuario_id,
      u.nombre AS usuario_nombre,
      u.numero_documento,
      m.tipo_movimiento,
      m.puntos,
      m.descripcion,
      m.origen,
      m.referencia_id,
      m.fecha_movimiento
    FROM movimientos_puntos m
    INNER JOIN usuarios u ON u.id = m.usuario_id
    WHERE m.usuario_id = $1
    ORDER BY m.id DESC;
  `;

  const { rows } = await pool.query(query, [usuarioId]);
  return rows;
};

module.exports = {
  listarMovimientos,
  obtenerMovimientoPorId,
  listarMovimientosPorUsuario
};
