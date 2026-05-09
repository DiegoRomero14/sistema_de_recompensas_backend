const pool = require('../config/db');
const redencionRepository = require('../repositories/redencion.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const reglaRedencionRepository = require('../repositories/reglaRedencion.repository');

const generarCodigoUnico = () => {
  return `RED-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const registrarRedencion = async (data) => {
  const { usuario_id, regla_redencion_id, observacion } = data;

  if (!usuario_id || isNaN(usuario_id)) {
    throw new Error('El usuario_id es obligatorio y debe ser numérico');
  }

  if (!regla_redencion_id || isNaN(regla_redencion_id)) {
    throw new Error('El regla_redencion_id es obligatorio y debe ser numérico');
  }

  const usuario = await usuarioRepository.obtenerUsuarioPorId(usuario_id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!usuario.estado) {
    throw new Error('El usuario está inactivo y no puede redimir puntos');
  }

  const regla = await reglaRedencionRepository.obtenerReglaRedencionPorId(
    regla_redencion_id
  );

  if (!regla) {
    throw new Error('Regla de redención no encontrada');
  }

  if (!regla.estado) {
    throw new Error('La regla de redención está inactiva');
  }

  const saldo = await usuarioRepository.obtenerSaldoUsuario(usuario_id);

  if (!saldo) {
    throw new Error('Saldo no encontrado');
  }

  const puntosUsados = Number(regla.puntos_requeridos);
  const valorRedimido = Number(regla.valor_equivalente);

  if (Number(saldo.saldo_actual) < puntosUsados) {
    throw new Error('El usuario no tiene puntos suficientes para redimir');
  }

  const codigoUnico = generarCodigoUnico();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const redencion = await redencionRepository.crearRedencion(client, {
      usuario_id,
      regla_redencion_id,
      puntos_usados: puntosUsados,
      valor_redimido: valorRedimido,
      codigo_unico: codigoUnico,
      observacion
    });

    await redencionRepository.crearMovimientoPuntos(client, {
      usuario_id,
      tipo_movimiento: 'REDENCION',
      puntos: puntosUsados,
      descripcion: `Redención aplicada con regla ${regla.nombre}`,
      origen: 'REDENCION',
      referencia_id: redencion.id
    });

    await redencionRepository.descontarSaldoPuntos(client, {
      usuario_id,
      puntos_restar: puntosUsados
    });

    await redencionRepository.crearAuditoria(client, {
      entidad: 'redenciones',
      entidad_id: redencion.id,
      accion: 'CREAR',
      detalle: `Redención registrada para usuario ${usuario_id} con ${puntosUsados} puntos usados`
    });

    await client.query('COMMIT');

    return {
      redencion_id: redencion.id,
      usuario_id: redencion.usuario_id,
      regla_redencion_id: redencion.regla_redencion_id,
      puntos_usados: redencion.puntos_usados,
      valor_redimido: redencion.valor_redimido,
      codigo_unico: redencion.codigo_unico,
      observacion: redencion.observacion,
      fecha_redencion: redencion.fecha_redencion
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const listarRedenciones = async () => {
  return await redencionRepository.listarRedenciones();
};

const obtenerRedencionPorId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la redención no es válido');
  }

  const redencion = await redencionRepository.obtenerRedencionPorId(id);

  if (!redencion) {
    throw new Error('Redención no encontrada');
  }

  return redencion;
};

module.exports = {
  registrarRedencion,
  listarRedenciones,
  obtenerRedencionPorId
};