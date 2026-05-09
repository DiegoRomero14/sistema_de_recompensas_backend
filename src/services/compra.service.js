const pool = require('../config/db');
const compraRepository = require('../repositories/compra.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const reglaAcumulacionRepository = require('../repositories/reglaAcumulacion.repository');

const registrarCompra = async (data) => {
  const { usuario_id, valor_compra, origen, observacion } = data;

  if (!usuario_id || isNaN(usuario_id)) {
    throw new Error('El usuario_id es obligatorio y debe ser numérico');
  }

  if (!valor_compra || isNaN(valor_compra) || Number(valor_compra) <= 0) {
    throw new Error('El valor_compra debe ser un número mayor a 0');
  }

  if (!origen || origen.trim() === '') {
    throw new Error('El campo origen es obligatorio');
  }

  const usuario = await usuarioRepository.obtenerUsuarioPorId(usuario_id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!usuario.estado) {
    throw new Error('El usuario está inactivo y no puede registrar compras');
  }

  const reglaActiva = await reglaAcumulacionRepository.obtenerReglaActiva();

  if (!reglaActiva) {
    throw new Error('No existe una regla de acumulación activa');
  }

  const valorCompraNumero = Number(valor_compra);
  const montoBase = Number(reglaActiva.monto_base);
  const puntosOtorgados = Number(reglaActiva.puntos_otorgados);

  const vecesQueAplica = Math.floor(valorCompraNumero / montoBase);
  const puntosGanados = vecesQueAplica * puntosOtorgados;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const compra = await compraRepository.crearCompra(client, {
      usuario_id,
      valor_compra: valorCompraNumero,
      origen,
      observacion
    });

    await compraRepository.crearMovimientoPuntos(client, {
      usuario_id,
      tipo_movimiento: 'ACUMULACION',
      puntos: puntosGanados,
      descripcion: `Compra registrada por valor de ${valorCompraNumero}. Regla aplicada: ${reglaActiva.nombre}`,
      origen,
      referencia_id: compra.id
    });

    await compraRepository.actualizarSaldoPuntos(client, {
      usuario_id,
      puntos_sumar: puntosGanados
    });

    await compraRepository.crearAuditoria(client, {
      entidad: 'compras',
      entidad_id: compra.id,
      accion: 'CREAR',
      detalle: `Compra registrada para usuario ${usuario_id} con ${puntosGanados} puntos generados`
    });

    await client.query('COMMIT');

    return {
      compra_id: compra.id,
      usuario_id: compra.usuario_id,
      valor_compra: compra.valor_compra,
      origen: compra.origen,
      observacion: compra.observacion,
      fecha_compra: compra.fecha_compra,
      regla_aplicada: {
        id: reglaActiva.id,
        nombre: reglaActiva.nombre,
        monto_base: reglaActiva.monto_base,
        puntos_otorgados: reglaActiva.puntos_otorgados
      },
      puntos_ganados: puntosGanados
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const listarCompras = async () => {
  return await compraRepository.listarCompras();
};

const obtenerCompraPorId = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error('El id de la compra no es válido');
  }

  const compra = await compraRepository.obtenerCompraPorId(id);

  if (!compra) {
    throw new Error('Compra no encontrada');
  }

  return compra;
};

module.exports = {
  registrarCompra,
  listarCompras,
  obtenerCompraPorId
};