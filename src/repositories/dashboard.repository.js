const pool = require('../config/db');

const obtenerMetricas = async () => {
  const query = `
    WITH limites AS (
      SELECT
        date_trunc('month', CURRENT_DATE)::timestamp AS mes_actual,
        (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::timestamp AS mes_anterior,
        CURRENT_DATE::date AS hoy,
        (CURRENT_DATE - INTERVAL '1 day')::date AS ayer
    )
    SELECT
      (
        SELECT COUNT(*)::int
        FROM usuarios
        WHERE estado = TRUE
      ) AS usuarios_activos,
      (
        SELECT COUNT(*)::int
        FROM usuarios, limites
        WHERE estado = TRUE
          AND fecha_creacion >= limites.mes_actual
      ) AS usuarios_mes_actual,
      (
        SELECT COUNT(*)::int
        FROM usuarios, limites
        WHERE estado = TRUE
          AND fecha_creacion >= limites.mes_anterior
          AND fecha_creacion < limites.mes_actual
      ) AS usuarios_mes_anterior,
      (
        SELECT COALESCE(SUM(m.puntos), 0)::bigint
        FROM movimientos_puntos m
        INNER JOIN usuarios u ON u.id = m.usuario_id
        WHERE u.estado = TRUE
          AND m.tipo_movimiento = 'ACUMULACION'
      ) AS puntos_acumulados,
      (
        SELECT COALESCE(SUM(m.puntos), 0)::bigint
        FROM movimientos_puntos m
        INNER JOIN usuarios u ON u.id = m.usuario_id
        CROSS JOIN limites
        WHERE u.estado = TRUE
          AND m.tipo_movimiento = 'ACUMULACION'
          AND m.fecha_movimiento >= limites.mes_actual
      ) AS puntos_acumulados_mes_actual,
      (
        SELECT COALESCE(SUM(m.puntos), 0)::bigint
        FROM movimientos_puntos m
        INNER JOIN usuarios u ON u.id = m.usuario_id
        CROSS JOIN limites
        WHERE u.estado = TRUE
          AND m.tipo_movimiento = 'ACUMULACION'
          AND m.fecha_movimiento >= limites.mes_anterior
          AND m.fecha_movimiento < limites.mes_actual
      ) AS puntos_acumulados_mes_anterior,
      (
        SELECT COALESCE(SUM(m.puntos), 0)::bigint
        FROM movimientos_puntos m
        INNER JOIN usuarios u ON u.id = m.usuario_id
        WHERE u.estado = TRUE
          AND m.tipo_movimiento = 'REDENCION'
      ) AS puntos_redimidos,
      (
        SELECT COALESCE(SUM(m.puntos), 0)::bigint
        FROM movimientos_puntos m
        INNER JOIN usuarios u ON u.id = m.usuario_id
        CROSS JOIN limites
        WHERE u.estado = TRUE
          AND m.tipo_movimiento = 'REDENCION'
          AND m.fecha_movimiento >= limites.mes_actual
      ) AS puntos_redimidos_mes_actual,
      (
        SELECT COALESCE(SUM(m.puntos), 0)::bigint
        FROM movimientos_puntos m
        INNER JOIN usuarios u ON u.id = m.usuario_id
        CROSS JOIN limites
        WHERE u.estado = TRUE
          AND m.tipo_movimiento = 'REDENCION'
          AND m.fecha_movimiento >= limites.mes_anterior
          AND m.fecha_movimiento < limites.mes_actual
      ) AS puntos_redimidos_mes_anterior,
      (
        SELECT COUNT(*)::int
        FROM redenciones r
        INNER JOIN usuarios u ON u.id = r.usuario_id
        CROSS JOIN limites
        WHERE u.estado = TRUE
          AND r.fecha_redencion::date = limites.hoy
      ) AS redenciones_hoy,
      (
        SELECT COUNT(*)::int
        FROM redenciones r
        INNER JOIN usuarios u ON u.id = r.usuario_id
        CROSS JOIN limites
        WHERE u.estado = TRUE
          AND r.fecha_redencion::date = limites.ayer
      ) AS redenciones_ayer;
  `;

  const { rows } = await pool.query(query);
  return rows[0];
};

const obtenerAcumulacionMensual = async () => {
  const query = `
    WITH meses AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      )::date AS periodo
    )
    SELECT
      to_char(meses.periodo, 'YYYY-MM') AS periodo,
      COALESCE(SUM(m.puntos), 0)::bigint AS puntos
    FROM meses
    LEFT JOIN movimientos_puntos m
      ON date_trunc('month', m.fecha_movimiento)::date = meses.periodo
      AND m.tipo_movimiento = 'ACUMULACION'
      AND EXISTS (
        SELECT 1
        FROM usuarios u
        WHERE u.id = m.usuario_id
          AND u.estado = TRUE
      )
    GROUP BY meses.periodo
    ORDER BY meses.periodo;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerDistribucionTransacciones = async () => {
  const query = `
    SELECT
      COALESCE(NULLIF(TRIM(m.origen), ''), 'Sin origen') AS nombre,
      COALESCE(SUM(m.puntos), 0)::bigint AS puntos,
      COUNT(*)::int AS movimientos
    FROM movimientos_puntos m
    INNER JOIN usuarios u ON u.id = m.usuario_id
    WHERE u.estado = TRUE
    GROUP BY COALESCE(NULLIF(TRIM(m.origen), ''), 'Sin origen')
    ORDER BY puntos DESC, nombre ASC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerTopClientes = async () => {
  const query = `
    SELECT
      u.id,
      u.nombre,
      u.correo,
      COALESCE(s.saldo_actual, 0)::bigint AS saldo_actual
    FROM usuarios u
    LEFT JOIN saldos_puntos s ON s.usuario_id = u.id
    WHERE u.estado = TRUE
      AND COALESCE(s.saldo_actual, 0) > 0
    ORDER BY COALESCE(s.saldo_actual, 0) DESC, u.nombre ASC
    LIMIT 5;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerMovimientosRecientes = async () => {
  const query = `
    SELECT
      m.id,
      m.usuario_id,
      u.nombre AS usuario_nombre,
      m.tipo_movimiento,
      m.puntos,
      COALESCE(NULLIF(TRIM(m.origen), ''), 'Sin origen') AS origen,
      m.fecha_movimiento
    FROM movimientos_puntos m
    INNER JOIN usuarios u ON u.id = m.usuario_id
    WHERE u.estado = TRUE
    ORDER BY m.fecha_movimiento DESC, m.id DESC
    LIMIT 5;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerAuditoriaSaldo = async () => {
  const query = `
    SELECT
      (
        SELECT COALESCE(SUM(s.saldo_actual), 0)::bigint
        FROM saldos_puntos s
        INNER JOIN usuarios u ON u.id = s.usuario_id
        WHERE u.estado = TRUE
      ) AS saldo_total,
      (
        SELECT MAX(fecha_creacion)
        FROM auditoria
      ) AS ultima_auditoria;
  `;

  const { rows } = await pool.query(query);
  return rows[0];
};

const obtenerNotificaciones = async () => {
  const query = `
    WITH novedades AS (
      SELECT
        ('usuario-' || u.id)::text AS id,
        'usuario'::text AS tipo,
        'Nuevo usuario registrado'::text AS titulo,
        (u.nombre || ' se registro como ' || LOWER(COALESCE(rol_actual.nombre, 'ADMINISTRADOR')))::text AS detalle,
        u.fecha_creacion AS fecha
      FROM usuarios u
      LEFT JOIN LATERAL (
        SELECT r.nombre
        FROM usuarios_roles ur
        INNER JOIN roles r ON r.id = ur.rol_id
        WHERE ur.usuario_id = u.id
        ORDER BY ur.fecha_asignacion DESC, ur.id DESC
        LIMIT 1
      ) rol_actual ON TRUE

      UNION ALL

      SELECT
        ('movimiento-' || m.id)::text AS id,
        LOWER(m.tipo_movimiento)::text AS tipo,
        CASE
          WHEN m.tipo_movimiento = 'REDENCION' THEN 'Redencion registrada'
          ELSE 'Puntos acumulados'
        END::text AS titulo,
        (
          u.nombre ||
          CASE
            WHEN m.tipo_movimiento = 'REDENCION' THEN ' redimio '
            ELSE ' acumulo '
          END ||
          m.puntos || ' pts en ' || COALESCE(NULLIF(TRIM(m.origen), ''), 'Sin origen')
        )::text AS detalle,
        m.fecha_movimiento AS fecha
      FROM movimientos_puntos m
      INNER JOIN usuarios u ON u.id = m.usuario_id
      WHERE u.estado = TRUE

      UNION ALL

      SELECT
        ('regla-acumulacion-' || ra.id)::text AS id,
        'regla_acumulacion'::text AS tipo,
        'Regla de acumulacion creada'::text AS titulo,
        ra.nombre::text AS detalle,
        ra.fecha_creacion AS fecha
      FROM reglas_acumulacion ra

      UNION ALL

      SELECT
        ('regla-redencion-' || rr.id)::text AS id,
        'regla_redencion'::text AS tipo,
        'Regla de redencion creada'::text AS titulo,
        rr.nombre::text AS detalle,
        rr.fecha_creacion AS fecha
      FROM reglas_redencion rr
    )
    SELECT id, tipo, titulo, detalle, fecha
    FROM novedades
    ORDER BY fecha DESC, id DESC
    LIMIT 8;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerResumenAdmin = async () => {
  const [
    metricas,
    acumulacionMensual,
    distribucionTransacciones,
    topClientes,
    movimientosRecientes,
    auditoriaSaldo,
    notificaciones
  ] = await Promise.all([
    obtenerMetricas(),
    obtenerAcumulacionMensual(),
    obtenerDistribucionTransacciones(),
    obtenerTopClientes(),
    obtenerMovimientosRecientes(),
    obtenerAuditoriaSaldo(),
    obtenerNotificaciones()
  ]);

  return {
    metricas,
    acumulacionMensual,
    distribucionTransacciones,
    topClientes,
    movimientosRecientes,
    auditoriaSaldo,
    notificaciones
  };
};

module.exports = {
  obtenerResumenAdmin
};
