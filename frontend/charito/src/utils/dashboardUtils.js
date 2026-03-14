// src/config/utils/dashboardUtils.js

const FECHAS_INICIO_PROGRAMACION = ["2026-03-12", "2026-03-13"]

const normalizarFecha = (fecha) => {
  if (!fecha) return null

  const [year, month, day] = String(fecha).split("-")
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  date.setHours(0, 0, 0, 0)

  return Number.isNaN(date.getTime()) ? null : date
}

const ordenarPorFecha = (fechaA, fechaB) => {
  const dateA = normalizarFecha(fechaA)
  const dateB = normalizarFecha(fechaB)

  if (!dateA && !dateB) return 0
  if (!dateA) return 1
  if (!dateB) return -1

  return dateA - dateB
}

const obtenerSemanaLaboral = (referencia = new Date()) => {
  const base = new Date(referencia)
  base.setHours(0, 0, 0, 0)

  const ultimoDomingo = new Date(base)
  ultimoDomingo.setDate(base.getDate() - base.getDay())

  const finSemanaLaboral = new Date(ultimoDomingo)
  finSemanaLaboral.setDate(ultimoDomingo.getDate() + 3)

  return {
    inicio: ultimoDomingo,
    fin: finSemanaLaboral,
  }
}

const fechaEnPeriodo = (
  fecha,
  periodo,
  fechaInicio,
  fechaFin,
  referencia = new Date()
) => {
  const fechaBase = normalizarFecha(fecha)
  if (!fechaBase) return false

  if (periodo === "historico") return true

  const hoy = new Date(referencia)
  hoy.setHours(0, 0, 0, 0)

  if (periodo === "hoy") {
    return fechaBase.getTime() === hoy.getTime()
  }

  if (periodo === "semana_laboral") {
    const { inicio, fin } = obtenerSemanaLaboral(referencia)
    return fechaBase >= inicio && fechaBase <= fin
  }

  if (periodo === "rango") {
    const inicio = normalizarFecha(fechaInicio)
    const fin = normalizarFecha(fechaFin)
    if (!inicio || !fin) return false
    return fechaBase >= inicio && fechaBase <= fin
  }

  return true
}

const obtenerUltimoPagoPorVenta = (pagos) => {
  const ultimoPagoPorVenta = new Map()

  pagos.forEach((pago) => {
    const actual = ultimoPagoPorVenta.get(pago.venta)

    if (!actual) {
      ultimoPagoPorVenta.set(pago.venta, pago)
      return
    }

    const fechaActual = normalizarFecha(actual.fecha_pago)
    const fechaNueva = normalizarFecha(pago.fecha_pago)

    if (fechaNueva && fechaActual && fechaNueva >= fechaActual) {
      ultimoPagoPorVenta.set(pago.venta, pago)
    }
  })

  return ultimoPagoPorVenta
}

export const obtenerEtiquetaPeriodoDashboard = (
  periodo,
  fechaInicio,
  fechaFin,
  referencia = new Date()
) => {
  if (periodo === "historico") return "Canceladas historicas y primeros cobros de todo el sistema"
  if (periodo === "hoy") return "Canceladas y primeros cobros del dia"

  if (periodo === "semana_laboral") {
    const { inicio, fin } = obtenerSemanaLaboral(referencia)
    const formatear = (fecha) =>
      fecha.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

    return `Semana de cobranza: ${formatear(inicio)} al ${formatear(fin)}`
  }

  if (periodo === "rango" && fechaInicio && fechaFin) {
    return `Rango personalizado: ${fechaInicio} al ${fechaFin}`
  }

  return "Selecciona un periodo para visualizar canceladas y primeros cobros"
}

export const calcularMetricasDashboard = (
  ventas,
  cobradores,
  pagos,
  periodo,
  fechaInicio,
  fechaFin
) => {
  const estadosInactivos = ["cancelada", "recogido", "bajada"]

  const ventasActivas = ventas.filter(
    (venta) =>
      !estadosInactivos.includes(venta.estado?.toLowerCase()) &&
      parseFloat(venta.saldo_pendiente) > 0
  )

  const clientesPorZona = {
    milagro: ventasActivas.filter((venta) => venta.zona === "milagro").length,
    huanchaco: ventasActivas.filter((venta) => venta.zona === "huanchaco").length,
    buenosAires: ventasActivas.filter((venta) => venta.zona === "buenos aires").length,
  }

  const ultimoPagoPorVenta = obtenerUltimoPagoPorVenta(pagos)

  const ventasCanceladasEnPeriodo = ventas.filter((venta) => {
    if (venta.estado?.toLowerCase() !== "cancelado") return false

    const ultimoPago = ultimoPagoPorVenta.get(venta.id)
    if (!ultimoPago) return periodo === "historico"

    return fechaEnPeriodo(
      ultimoPago.fecha_pago,
      periodo,
      fechaInicio,
      fechaFin
    )
  })

  const contratosPrimerCobroPeriodo = ventas
    .filter((venta) => {
      if (!venta.fecha_primer_cobro) return false
      if (venta.primer_pago_registrado) return false
      if (parseFloat(venta.saldo_pendiente) <= 0) return false

      return fechaEnPeriodo(
        venta.fecha_primer_cobro,
        periodo,
        fechaInicio,
        fechaFin
      )
    })
    .map((venta) => ({
      id: venta.id,
      numero_contrato: venta.numero_contrato,
      cliente: venta.cliente || `${venta.nombre} ${venta.apellido}`,
      cobrador: venta.cobrador,
      cobrador_nombre: venta.cobrador_nombre,
      fecha_venta: venta.fecha_venta,
      fecha_primer_cobro: venta.fecha_primer_cobro,
      saldo_pendiente: venta.saldo_pendiente,
      entregado_cobrador: Boolean(venta.entregado_cobrador),
      fecha_entrega_cobrador: venta.fecha_entrega_cobrador,
      zona: venta.zona,
    }))
    .sort((a, b) => {
      const porFecha = ordenarPorFecha(a.fecha_primer_cobro, b.fecha_primer_cobro)
      if (porFecha !== 0) return porFecha
      return String(a.numero_contrato).localeCompare(String(b.numero_contrato))
    })

  const clientesPorCobrador = cobradores.map((cobrador) => ({
    nombre: cobrador.nombre,
    cantidad: ventasActivas.filter(
      (venta) => venta.cobrador === cobrador.id
    ).length,
    canceladas: ventasCanceladasEnPeriodo.filter(
      (venta) => venta.cobrador === cobrador.id
    ).length,
    bajadas: ventas.filter(
      (venta) =>
        venta.cobrador === cobrador.id &&
        venta.estado?.toLowerCase() === "bajada"
    ).length,
    zona: cobrador.zona,
  }))

  const canceladasPorCobrador = cobradores.map((cobrador) => ({
    id: cobrador.id,
    nombre: cobrador.nombre,
    zona: cobrador.zona,
    cantidad: ventasCanceladasEnPeriodo.filter(
      (venta) => venta.cobrador === cobrador.id
    ).length,
  }))

  const primerosCobrosPorCobrador = cobradores.map((cobrador) => {
    const contratos = contratosPrimerCobroPeriodo.filter(
      (venta) => venta.cobrador === cobrador.id
    )

    return {
      id: cobrador.id,
      nombre: cobrador.nombre,
      zona: cobrador.zona,
      cantidad: contratos.length,
      entregados: contratos.filter((venta) => venta.entregado_cobrador).length,
      pendientes: contratos.filter((venta) => !venta.entregado_cobrador).length,
      contratos,
    }
  })

  const contratosPendientesProgramacion = ventas
    .filter((venta) => {
      if (venta.fecha_primer_cobro) return false
      if (Number(venta.inicial || 0) > 0) return false
      if (venta.primer_pago_registrado) return false
      return FECHAS_INICIO_PROGRAMACION.includes(venta.fecha_venta)
    })
    .map((venta) => ({
      id: venta.id,
      numero_contrato: venta.numero_contrato,
      cliente: venta.cliente || `${venta.nombre} ${venta.apellido}`,
      cobrador_nombre: venta.cobrador_nombre,
      fecha_venta: venta.fecha_venta,
      zona: venta.zona,
    }))
    .sort((a, b) => ordenarPorFecha(a.fecha_venta, b.fecha_venta))

  return {
    ventasActivas,
    clientesPorZona,
    clientesPorCobrador,
    canceladasPorCobrador,
    contratosPrimerCobroPeriodo,
    primerosCobrosPorCobrador,
    contratosPendientesProgramacion,
  }
}
