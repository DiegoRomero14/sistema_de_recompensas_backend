const dashboardRepository = require('../repositories/dashboard.repository');

const numero = (value) => Number(value || 0);

const calcularVariacion = (actual, anterior) => {
  const valorActual = numero(actual);
  const valorAnterior = numero(anterior);

  if (valorAnterior === 0) {
    return valorActual > 0 ? 100 : 0;
  }

  return ((valorActual - valorAnterior) / valorAnterior) * 100;
};

const crearMetrica = (valor, actualPeriodo, periodoAnterior, etiqueta) => {
  const variacion = calcularVariacion(actualPeriodo, periodoAnterior);

  return {
    valor: numero(valor),
    variacion: {
      porcentaje: Number(Math.abs(variacion).toFixed(1)),
      direccion: variacion < 0 ? 'down' : variacion > 0 ? 'up' : 'neutral',
      etiqueta
    }
  };
};

const obtenerResumenAdmin = async () => {
  const resumen = await dashboardRepository.obtenerResumenAdmin();
  const metricas = resumen.metricas || {};
  const auditoriaSaldo = resumen.auditoriaSaldo || {};
  const saldoTotal = numero(auditoriaSaldo.saldo_total);

  return {
    metricas: {
      usuarios_activos: crearMetrica(
        metricas.usuarios_activos,
        metricas.usuarios_mes_actual,
        metricas.usuarios_mes_anterior,
        'vs. mes anterior'
      ),
      puntos_acumulados: crearMetrica(
        metricas.puntos_acumulados,
        metricas.puntos_acumulados_mes_actual,
        metricas.puntos_acumulados_mes_anterior,
        'vs. mes anterior'
      ),
      puntos_redimidos: crearMetrica(
        metricas.puntos_redimidos,
        metricas.puntos_redimidos_mes_actual,
        metricas.puntos_redimidos_mes_anterior,
        'vs. mes anterior'
      ),
      redenciones_hoy: crearMetrica(
        metricas.redenciones_hoy,
        metricas.redenciones_hoy,
        metricas.redenciones_ayer,
        'vs. ayer'
      )
    },
    graficas: {
      acumulacion_mensual: resumen.acumulacionMensual.map((item) => ({
        periodo: item.periodo,
        puntos: numero(item.puntos)
      })),
      distribucion_transacciones: resumen.distribucionTransacciones.map((item) => ({
        nombre: item.nombre,
        puntos: numero(item.puntos),
        movimientos: numero(item.movimientos)
      }))
    },
    top_clientes: resumen.topClientes.map((cliente) => ({
      id: cliente.id,
      nombre: cliente.nombre,
      correo: cliente.correo,
      saldo_actual: numero(cliente.saldo_actual)
    })),
    movimientos_recientes: resumen.movimientosRecientes.map((movimiento) => ({
      id: movimiento.id,
      usuario_id: movimiento.usuario_id,
      usuario_nombre: movimiento.usuario_nombre,
      tipo_movimiento: movimiento.tipo_movimiento,
      puntos: numero(movimiento.puntos),
      origen: movimiento.origen,
      estado: 'Completado',
      fecha_movimiento: movimiento.fecha_movimiento
    })),
    notificaciones: (resumen.notificaciones || []).map((notificacion) => ({
      id: notificacion.id,
      tipo: notificacion.tipo,
      titulo: notificacion.titulo,
      detalle: notificacion.detalle,
      fecha: notificacion.fecha
    })),
    auditoria: {
      saldo_total: saldoTotal,
      valor_equivalente: Number((saldoTotal * 0.01).toFixed(2)),
      ultima_auditoria: auditoriaSaldo.ultima_auditoria
    }
  };
};

module.exports = {
  obtenerResumenAdmin
};
