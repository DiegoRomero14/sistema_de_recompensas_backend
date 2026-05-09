const pool = require('../config/db');

const crearReglaAcumulacion = async ({
  nombre,
  descripcion,
  monto_base,
  puntos_otorgados,
  estado
}) => {
  const query = `
    INSERT INTO reglas_acumulacion (
      nombre,
      descripcion,
      monto_base,
      puntos_otorgados,
      estado
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [nombre, descripcion || null, monto_base, puntos_otorgados, estado];
  const { rows } = await pool.query(query, values);

  return rows[0];
};

const listarReglasAcumulacion = async () => {
  const query = `
    SELECT
      id,
      nombre,
      descripcion,
      monto_base,
      puntos_otorgados,
      estado,
      fecha_creacion
    FROM reglas_acumulacion
    ORDER BY id DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const obtenerReglaAcumulacionPorId = async (id) => {
  const query = `
    SELECT
      id,
      nombre,
      descripcion,
      monto_base,
      puntos_otorgados,
      estado,
      fecha_creacion
    FROM reglas_acumulacion
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const actualizarReglaAcumulacion = async (
  id,
  { nombre, descripcion, monto_base, puntos_otorgados, estado }
) => {
  const query = `
    UPDATE reglas_acumulacion
    SET
      nombre = $1,
      descripcion = $2,
      monto_base = $3,
      puntos_otorgados = $4,
      estado = $5
    WHERE id = $6
    RETURNING *;
  `;

  const values = [nombre, descripcion || null, monto_base, puntos_otorgados, estado, id];
  const { rows } = await pool.query(query, values);

  return rows[0];
};

const cambiarEstadoReglaAcumulacion = async (id, estado) => {
  const query = `
    UPDATE reglas_acumulacion
    SET estado = $1
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [estado, id]);
  return rows[0];
};

const obtenerReglaActiva = async () => {
  const query = `
    SELECT
      id,
      nombre,
      descripcion,
      monto_base,
      puntos_otorgados,
      estado,
      fecha_creacion
    FROM reglas_acumulacion
    WHERE estado = true
    ORDER BY id DESC
    LIMIT 1;
  `;

  const { rows } = await pool.query(query);
  return rows[0];
};

module.exports = {
  crearReglaAcumulacion,
  listarReglasAcumulacion,
  obtenerReglaAcumulacionPorId,
  actualizarReglaAcumulacion,
  cambiarEstadoReglaAcumulacion,
  obtenerReglaActiva
};