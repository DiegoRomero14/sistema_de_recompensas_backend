const pool = require('../config/db');

const MODULOS_PERMISOS = [
  'usuarios',
  'acumulacion',
  'redencion',
  'historial',
  'reportes',
  'exportacion',
  'configuracion'
];

const PERMISOS_BASE = {
  ADMINISTRADOR: {
    usuarios: 'completo',
    acumulacion: 'completo',
    redencion: 'completo',
    historial: 'completo',
    reportes: 'completo',
    exportacion: 'completo',
    configuracion: 'completo'
  },
  OPERADOR: {
    usuarios: 'completo',
    acumulacion: 'completo',
    redencion: 'completo',
    historial: 'completo',
    reportes: 'completo',
    exportacion: 'completo',
    configuracion: 'ninguno'
  },
  CONSULTA: {
    usuarios: 'lectura',
    acumulacion: 'ninguno',
    redencion: 'ninguno',
    historial: 'lectura',
    reportes: 'lectura',
    exportacion: 'lectura',
    configuracion: 'ninguno'
  }
};

const obtenerPermisosBase = (nombre = '') => {
  return {
    ...(PERMISOS_BASE[String(nombre).toUpperCase()] || {
      usuarios: 'lectura',
      acumulacion: 'ninguno',
      redencion: 'ninguno',
      historial: 'lectura',
      reportes: 'lectura',
      exportacion: 'ninguno',
      configuracion: 'ninguno'
    })
  };
};

const asegurarEsquemaPermisos = async (connection = pool) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS roles_permisos (
      id BIGSERIAL PRIMARY KEY,
      rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      modulo VARCHAR(50) NOT NULL,
      nivel VARCHAR(20) NOT NULL DEFAULT 'ninguno',
      UNIQUE (rol_id, modulo)
    );
  `);

  for (const [nombreRol, permisos] of Object.entries(PERMISOS_BASE)) {
    for (const [modulo, nivel] of Object.entries(permisos)) {
      await connection.query(
        `
          INSERT INTO roles_permisos (rol_id, modulo, nivel)
          SELECT id, $2, $3
          FROM roles
          WHERE nombre = $1
          ON CONFLICT (rol_id, modulo) DO NOTHING;
        `,
        [nombreRol, modulo, nivel]
      );
    }
  }
};

const formatearRol = (rol, permisosPorRol) => {
  const permisos = obtenerPermisosBase(rol.nombre);

  (permisosPorRol.get(Number(rol.id)) || []).forEach((permiso) => {
    if (MODULOS_PERMISOS.includes(permiso.modulo)) {
      permisos[permiso.modulo] = permiso.nivel;
    }
  });

  return {
    id: Number(rol.id),
    nombre: rol.nombre,
    codigo: String(rol.nombre || '').toLowerCase(),
    descripcion: rol.descripcion,
    usuarios_asignados: Number(rol.usuarios_asignados || 0),
    permisos
  };
};

const listarRoles = async () => {
  await asegurarEsquemaPermisos();

  const rolesQuery = `
    WITH rol_actual AS (
      SELECT DISTINCT ON (ur.usuario_id)
        ur.usuario_id,
        ur.rol_id
      FROM usuarios_roles ur
      ORDER BY ur.usuario_id, ur.fecha_asignacion DESC, ur.id DESC
    )
    SELECT
      r.id,
      r.nombre,
      r.descripcion,
      COUNT(u.id)::int AS usuarios_asignados
    FROM roles r
    LEFT JOIN rol_actual ra ON ra.rol_id = r.id
    LEFT JOIN usuarios u ON u.id = ra.usuario_id AND u.estado = TRUE
    GROUP BY r.id, r.nombre, r.descripcion
    ORDER BY
      CASE r.nombre
        WHEN 'ADMINISTRADOR' THEN 1
        WHEN 'OPERADOR' THEN 2
        WHEN 'CONSULTA' THEN 3
        ELSE 4
      END,
      r.nombre ASC;
  `;
  const permisosQuery = `
    SELECT rol_id, modulo, nivel
    FROM roles_permisos
    ORDER BY rol_id, modulo;
  `;
  const [rolesResult, permisosResult] = await Promise.all([
    pool.query(rolesQuery),
    pool.query(permisosQuery)
  ]);
  const permisosPorRol = new Map();

  permisosResult.rows.forEach((permiso) => {
    const rolId = Number(permiso.rol_id);
    const permisos = permisosPorRol.get(rolId) || [];
    permisos.push(permiso);
    permisosPorRol.set(rolId, permisos);
  });

  const roles = rolesResult.rows.map((rol) => formatearRol(rol, permisosPorRol));
  const buscarConteo = (codigo) => {
    const rol = roles.find((item) => item.codigo === codigo);
    return rol ? rol.usuarios_asignados : 0;
  };

  return {
    roles,
    metricas: {
      roles_configurados: roles.length,
      usuarios_administradores: buscarConteo('administrador'),
      operadores_activos: buscarConteo('operador'),
      usuarios_consulta: buscarConteo('consulta')
    }
  };
};

const obtenerRolPorId = async (id, connection = pool) => {
  await asegurarEsquemaPermisos(connection);

  const { rows } = await connection.query(
    `
      SELECT id, nombre, descripcion
      FROM roles
      WHERE id = $1;
    `,
    [id]
  );

  return rows[0] || null;
};

const obtenerRolPorNombre = async (nombre, connection = pool) => {
  const { rows } = await connection.query(
    `
      SELECT id, nombre, descripcion
      FROM roles
      WHERE nombre = $1;
    `,
    [String(nombre || '').trim().toUpperCase()]
  );

  return rows[0] || null;
};

const guardarPermisosRol = async (rolId, permisos = {}, connection = pool) => {
  for (const modulo of MODULOS_PERMISOS) {
    const nivel = permisos[modulo] || 'ninguno';
    await connection.query(
      `
        INSERT INTO roles_permisos (rol_id, modulo, nivel)
        VALUES ($1, $2, $3)
        ON CONFLICT (rol_id, modulo)
        DO UPDATE SET nivel = EXCLUDED.nivel;
      `,
      [rolId, modulo, nivel]
    );
  }
};

const crearRol = async ({ nombre, descripcion, permisos }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await asegurarEsquemaPermisos(client);

    const { rows } = await client.query(
      `
        INSERT INTO roles (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING id;
      `,
      [String(nombre).trim().toUpperCase(), descripcion || null]
    );

    await guardarPermisosRol(rows[0].id, permisos, client);
    await client.query('COMMIT');
    return await listarRoles();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const actualizarRol = async (id, { nombre, descripcion, permisos }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await asegurarEsquemaPermisos(client);

    if (nombre || descripcion !== undefined) {
      await client.query(
        `
          UPDATE roles
          SET
            nombre = COALESCE($2, nombre),
            descripcion = $3
          WHERE id = $1;
        `,
        [id, nombre ? String(nombre).trim().toUpperCase() : null, descripcion || null]
      );
    }

    if (permisos) {
      await guardarPermisosRol(id, permisos, client);
    }

    await client.query('COMMIT');
    return await listarRoles();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const asignarUsuarios = async (rolId, usuariosIds = []) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await asegurarEsquemaPermisos(client);

    for (const usuarioId of usuariosIds) {
      await client.query('DELETE FROM usuarios_roles WHERE usuario_id = $1;', [usuarioId]);
      await client.query(
        `
          INSERT INTO usuarios_roles (usuario_id, rol_id)
          VALUES ($1, $2);
        `,
        [usuarioId, rolId]
      );
    }

    await client.query('COMMIT');
    return await listarRoles();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  MODULOS_PERMISOS,
  obtenerPermisosBase,
  listarRoles,
  obtenerRolPorId,
  obtenerRolPorNombre,
  crearRol,
  actualizarRol,
  asignarUsuarios
};
