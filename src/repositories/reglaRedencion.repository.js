const pool = require('../config/db');

const crearReglaRedencion = async ({
  nombre,
  descripcion,
  puntos_requeridos,
  valor_equivalente,
  estado
}) => {
  const query = `
    INSERT INTO reglas_redencion (
      nombre,
      descripcion,
      puntos_requeridos,
      valor_equivalente,
      estado
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    nombre,
    descripcion || null,
    puntos_requeridos,
    valor_equivalente,
    estado
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const listarReglasRedencion = async () => {
  const query = `
    SELECT
      id,
      nombre,
      descripcion,
      puntos_requeridos,
      valor_equivalente,
      estado,
      fecha_creacion
    FROM reglas_redencion
    ORDER BY id DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerReglaRedencionPorId = async (id) => {
  const query = `
    SELECT
      id,
      nombre,
      descripcion,
      puntos_requeridos,
      valor_equivalente,
      estado,
      fecha_creacion
    FROM reglas_redencion
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const actualizarReglaRedencion = async (
  id,
  { nombre, descripcion, puntos_requeridos, valor_equivalente, estado }
) => {
  const query = `
    UPDATE reglas_redencion
    SET
      nombre = $1,
      descripcion = $2,
      puntos_requeridos = $3,
      valor_equivalente = $4,
      estado = $5
    WHERE id = $6
    RETURNING *;
  `;

  const values = [
    nombre,
    descripcion || null,
    puntos_requeridos,
    valor_equivalente,
    estado,
    id
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const cambiarEstadoReglaRedencion = async (id, estado) => {
  const query = `
    UPDATE reglas_redencion
    SET estado = $1
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [estado, id]);
  return rows[0];
};

const obtenerReglaActivaRedencion = async () => {
  const query = `
    SELECT
      id,
      nombre,
      descripcion,
      puntos_requeridos,
      valor_equivalente,
      estado,
      fecha_creacion
    FROM reglas_redencion
    WHERE estado = true
    ORDER BY id DESC
    LIMIT 1;
  `;

  const { rows } = await pool.query(query);
  return rows[0];
};

module.exports = {
  crearReglaRedencion,
  listarReglasRedencion,
  obtenerReglaRedencionPorId,
  actualizarReglaRedencion,
  cambiarEstadoReglaRedencion,
  obtenerReglaActivaRedencion
};