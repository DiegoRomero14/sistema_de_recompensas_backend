const crearCompra = async (client, { usuario_id, valor_compra, origen, observacion }) => {
  const query = `
    INSERT INTO compras (
      usuario_id,
      valor_compra,
      origen,
      observacion
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [usuario_id, valor_compra, origen, observacion || null];
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

const actualizarSaldoPuntos = async (client, { usuario_id, puntos_sumar }) => {
  const query = `
    UPDATE saldos_puntos
    SET
      saldo_actual = saldo_actual + $1,
      ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE usuario_id = $2
    RETURNING *;
  `;

  const { rows } = await client.query(query, [puntos_sumar, usuario_id]);
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

const listarCompras = async () => {
  const pool = require('../config/db');

  const query = `
    SELECT
      c.id,
      c.usuario_id,
      u.nombre AS usuario_nombre,
      u.numero_documento,
      c.valor_compra,
      c.origen,
      c.observacion,
      c.fecha_compra
    FROM compras c
    INNER JOIN usuarios u ON u.id = c.usuario_id
    ORDER BY c.id DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerCompraPorId = async (id) => {
  const pool = require('../config/db');

  const query = `
    SELECT
      c.id,
      c.usuario_id,
      u.nombre AS usuario_nombre,
      u.numero_documento,
      c.valor_compra,
      c.origen,
      c.observacion,
      c.fecha_compra
    FROM compras c
    INNER JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = $1;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

module.exports = {
  crearCompra,
  crearMovimientoPuntos,
  actualizarSaldoPuntos,
  crearAuditoria,
  listarCompras,
  obtenerCompraPorId
};