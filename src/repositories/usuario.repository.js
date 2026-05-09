const pool = require('../config/db');

const camposPublicosUsuario = `
  u.id,
  u.tipo_documento,
  u.numero_documento,
  u.nombre,
  u.correo,
  u.telefono,
  LOWER(COALESCE(rol_actual.nombre, 'ADMINISTRADOR')) AS rol,
  COALESCE(s.saldo_actual, 0)::bigint AS saldo_actual,
  u.estado,
  u.fecha_creacion
`;

const camposPrivadosUsuario = `
  u.id,
  u.tipo_documento,
  u.numero_documento,
  u.nombre,
  u.correo,
  u.telefono,
  LOWER(COALESCE(rol_actual.nombre, 'ADMINISTRADOR')) AS rol,
  u.contrasena_hash,
  COALESCE(s.saldo_actual, 0)::bigint AS saldo_actual,
  u.estado,
  u.fecha_creacion
`;

const joinRolActual = `
  LEFT JOIN LATERAL (
    SELECT r.nombre
    FROM usuarios_roles ur
    INNER JOIN roles r ON r.id = ur.rol_id
    WHERE ur.usuario_id = u.id
    ORDER BY ur.fecha_asignacion DESC, ur.id DESC
    LIMIT 1
  ) rol_actual ON TRUE
`;

const joinSaldo = `
  LEFT JOIN saldos_puntos s ON s.usuario_id = u.id
`;

const obtenerUsuarioPublicoPorId = async (id, connection = pool) => {
  const query = `
    SELECT
      ${camposPublicosUsuario}
    FROM usuarios u
    ${joinRolActual}
    ${joinSaldo}
    WHERE u.id = $1;
  `;

  const { rows } = await connection.query(query, [id]);
  return rows[0];
};

const obtenerRolId = async (rol, connection) => {
  const nombreRol = (rol || 'administrador').toUpperCase();
  const query = `
    SELECT id
    FROM roles
    WHERE nombre = $1;
  `;

  const { rows } = await connection.query(query, [nombreRol]);

  if (!rows[0]) {
    throw new Error('El rol del usuario no existe en la base de datos');
  }

  return rows[0].id;
};

const crearUsuario = async ({
  tipo_documento,
  numero_documento,
  nombre,
  correo,
  telefono,
  rol,
  contrasena_hash
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query = `
      INSERT INTO usuarios (
        tipo_documento,
        numero_documento,
        nombre,
        correo,
        telefono,
        contrasena_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;

    const values = [
      tipo_documento,
      numero_documento,
      nombre,
      correo || null,
      telefono || null,
      contrasena_hash || null
    ];
    const { rows } = await client.query(query, values);
    const usuarioId = rows[0].id;
    const rolId = await obtenerRolId(rol, client);

    await client.query(
      `
        INSERT INTO usuarios_roles (
          usuario_id,
          rol_id
        )
        VALUES ($1, $2);
      `,
      [usuarioId, rolId]
    );

    const nuevoUsuario = await obtenerUsuarioPublicoPorId(usuarioId, client);
    await client.query('COMMIT');

    return nuevoUsuario;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const listarUsuarios = async (filtros = {}) => {
  const condiciones = [];
  const valores = [];

  if (filtros.buscar) {
    valores.push(`%${String(filtros.buscar).trim()}%`);
    condiciones.push(`(
      u.nombre ILIKE $${valores.length}
      OR u.correo ILIKE $${valores.length}
      OR u.numero_documento ILIKE $${valores.length}
      OR u.id::text ILIKE $${valores.length}
    )`);
  }

  if (filtros.tipo_documento) {
    valores.push(String(filtros.tipo_documento).trim());
    condiciones.push(`u.tipo_documento = $${valores.length}`);
  }

  if (typeof filtros.estado === 'boolean') {
    valores.push(filtros.estado);
    condiciones.push(`u.estado = $${valores.length}`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  const query = `
    SELECT
      ${camposPublicosUsuario}
    FROM usuarios u
    ${joinRolActual}
    ${joinSaldo}
    ${where}
    ORDER BY u.id DESC;
  `;

  const { rows } = await pool.query(query, valores);
  return rows;
};

const obtenerUsuarioPorId = async (id) => {
  return await obtenerUsuarioPublicoPorId(id);
};

const buscarPorNumeroDocumento = async (numero_documento) => {
  const query = `
    SELECT
      ${camposPrivadosUsuario}
    FROM usuarios u
    ${joinRolActual}
    ${joinSaldo}
    WHERE u.numero_documento = $1;
  `;

  const { rows } = await pool.query(query, [numero_documento]);
  return rows[0];
};

const buscarPorCorreo = async (correo) => {
  const query = `
    SELECT
      ${camposPrivadosUsuario}
    FROM usuarios u
    ${joinRolActual}
    ${joinSaldo}
    WHERE u.correo = $1;
  `;

  const { rows } = await pool.query(query, [correo]);
  return rows[0];
};

const actualizarEstadoUsuario = async (id, estado) => {
  const query = `
    UPDATE usuarios
    SET estado = $1
    WHERE id = $2
    RETURNING id;
  `;

  const { rows } = await pool.query(query, [estado, id]);
  return rows[0] ? await obtenerUsuarioPublicoPorId(rows[0].id) : null;
};

const crearSaldoInicial = async (usuarioId) => {
  const query = `
    INSERT INTO saldos_puntos (
      usuario_id,
      saldo_actual
    )
    VALUES ($1, $2);
  `;

  await pool.query(query, [usuarioId, 0]);
};

const obtenerSaldoUsuario = async (usuarioId) => {
  const query = `
    SELECT
      id,
      usuario_id,
      saldo_actual,
      ultima_actualizacion
    FROM saldos_puntos
    WHERE usuario_id = $1;
  `;

  const { rows } = await pool.query(query, [usuarioId]);
  return rows[0];
};

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  buscarPorNumeroDocumento,
  buscarPorCorreo,
  actualizarEstadoUsuario,
  crearSaldoInicial,
  obtenerSaldoUsuario
};
