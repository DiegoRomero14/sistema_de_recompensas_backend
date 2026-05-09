const crearRedencion = async (
  client,
  {
    usuario_id,
    regla_redencion_id,
    puntos_usados,
    valor_redimido,
    codigo_unico,
    observacion
  }
) => {
  const query = `
    INSERT INTO redenciones (
      usuario_id,
      regla_redencion_id,
      puntos_usados,
      valor_redimido,
      codigo_unico,
      observacion
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    usuario_id,
    regla_redencion_id,
    puntos_usados,
    valor_redimido,
    codigo_unico,
    observacion || null
  ];

  const { rows } = await client.query(query, values);
  return rows[0];
};

const crearMovimientoPuntos = async (
  client,
  { usuario_id, tipo_movimiento, puntos, descripcion, origen, referencia_id }
) => {
  const query = `
    INSERT INTO movimientos_puntos (
      usuario_id,
      tipo_movimiento,
      puntos,
      descripcion,
      origen,
      referencia_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    usuario_id,
    tipo_movimiento,
    puntos,
    descripcion || null,
    origen || null,
    referencia_id || null
  ];

  const { rows } = await client.query(query, values);
  return rows[0];
};

const descontarSaldoPuntos = async (client, { usuario_id, puntos_restar }) => {
  const query = `
    UPDATE saldos_puntos
    SET
      saldo_actual = saldo_actual - $1,
      ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE usuario_id = $2
    RETURNING *;
  `;

  const { rows } = await client.query(query, [puntos_restar, usuario_id]);
  return rows[0];
};

const crearAuditoria = async (client, { entidad, entidad_id, accion, detalle }) => {
  const query = `
    INSERT INTO auditoria (
      entidad,
      entidad_id,
      accion,
      detalle
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [entidad, entidad_id, accion, detalle || null];
  const { rows } = await client.query(query, values);
  return rows[0];
};

const listarRedenciones = async () => {
  const pool = require('../config/db');

  const query = `
    SELECT
      r.id,
      r.usuario_id,
      u.nombre AS usuario_nombre,
      u.numero_documento,
      r.regla_redencion_id,
      rr.nombre AS regla_nombre,
      r.puntos_usados,
      r.valor_redimido,
      r.codigo_unico,
      r.observacion,
      r.fecha_redencion
    FROM redenciones r
    INNER JOIN usuarios u ON u.id = r.usuario_id
    INNER JOIN reglas_redencion rr ON rr.id = r.regla_redencion_id
    ORDER BY r.id DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerRedencionPorId = async (id) => {
  const pool = require('../config/db');

  const query = `
    SELECT
      r.id,
      r.usuario_id,
      u.nombre AS usuario_nombre,
      u.numero_documento,
      r.regla_redencion_id,
      rr.nombre AS regla_nombre,
      r.puntos_usados,
      r.valor_redimido,
      r.codigo_unico,
      r.observacion,
      r.fecha_redencion
    FROM redenciones r
    INNER JOIN usuarios u ON u.id = r.usuario_id
    INNER JOIN reglas_redencion rr ON rr.id = r.regla_redencion_id
    WHERE r.id = $1;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

module.exports = {
  crearRedencion,
  crearMovimientoPuntos,
  descontarSaldoPuntos,
  crearAuditoria,
  listarRedenciones,
  obtenerRedencionPorId
};