// src/config/utils/dashboardUtils.js
import * as XLSX from "xlsx"

const FECHAS_INICIO_PROGRAMACION = ["2026-03-12", "2026-03-13"]
const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24
const LIMITE_CRITICO = {
  semanal: 28,
  quincenal: 60,
  mensual: 90,
}

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

const formatearFechaDashboard = (fecha) => {
  if (!fecha) return "No definida"

  const [year, month, day] = String(fecha).split("-")
  if (!year || !month || !day) return fecha

  return `${day}/${month}/${year}`
}

const diferenciaEnDias = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  inicio.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.floor((fin - inicio) / MILISEGUNDOS_POR_DIA)
}

const sumarMesesRespetandoFinDeMes = (fecha, cantidadMeses) => {
  const base = new Date(fecha)
  const diaOriginal = base.getDate()
  const primerDiaMesObjetivo = new Date(
    base.getFullYear(),
    base.getMonth() + cantidadMeses,
    1
  )
  const ultimoDiaMesObjetivo = new Date(
    primerDiaMesObjetivo.getFullYear(),
    primerDiaMesObjetivo.getMonth() + 1,
    0
  ).getDate()

  return new Date(
    primerDiaMesObjetivo.getFullYear(),
    primerDiaMesObjetivo.getMonth(),
    Math.min(diaOriginal, ultimoDiaMesObjetivo)
  )
}

const calcularMesesCompletos = (fechaInicio, fechaFin) => {
  let meses = 0

  while (true) {
    const siguiente = sumarMesesRespetandoFinDeMes(fechaInicio, meses + 1)
    if (siguiente <= fechaFin) {
      meses += 1
      continue
    }
    break
  }

  return meses
}

const pluralizar = (valor, singular, plural) =>
  `${valor} ${valor === 1 ? singular : plural}`

const formatearAtrasoSegunFrecuencia = (dias, frecuenciaPago, fechaReferencia) => {
  if (dias <= 0) return "Hoy"

  if (frecuenciaPago === "semanal") {
    if (dias < 7) return pluralizar(dias, "dia", "dias")
    const semanas = Math.floor(dias / 7)
    const diasRestantes = dias % 7
    return diasRestantes > 0
      ? `${pluralizar(semanas, "semana", "semanas")} y ${pluralizar(diasRestantes, "dia", "dias")}`
      : pluralizar(semanas, "semana", "semanas")
  }

  if (frecuenciaPago === "quincenal") {
    if (dias < 15) return pluralizar(dias, "dia", "dias")
    const quincenas = Math.floor(dias / 15)
    const diasRestantes = dias % 15
    return diasRestantes > 0
      ? `${pluralizar(quincenas, "quincena", "quincenas")} y ${pluralizar(diasRestantes, "dia", "dias")}`
      : pluralizar(quincenas, "quincena", "quincenas")
  }

  if (frecuenciaPago === "mensual") {
    const hoy = new Date()
    const meses = calcularMesesCompletos(fechaReferencia, hoy)

    if (meses < 1) return pluralizar(dias, "dia", "dias")

    const fechaAncla = sumarMesesRespetandoFinDeMes(fechaReferencia, meses)
    const diasRestantes = diferenciaEnDias(fechaAncla, hoy)
    return diasRestantes > 0
      ? `${pluralizar(meses, "mes", "meses")} y ${pluralizar(diasRestantes, "dia", "dias")}`
      : pluralizar(meses, "mes", "meses")
  }

  return pluralizar(dias, "dia", "dias")
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

const obtenerFechaReferenciaCobranza = (venta, ultimoPago) => {
  if (ultimoPago?.fecha_pago) return normalizarFecha(ultimoPago.fecha_pago)
  if (venta.fecha_inicial) return normalizarFecha(venta.fecha_inicial)
  return normalizarFecha(venta.fecha_venta)
}

const obtenerFechaUltimoMovimiento = (venta, ultimoPago) => {
  if (ultimoPago?.fecha_pago) return ultimoPago.fecha_pago
  if (venta.fecha_inicial) return venta.fecha_inicial
  return null
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

  const clientesCriticos = ventasActivas
    .map((venta) => {
      const ultimoPago = ultimoPagoPorVenta.get(venta.id)
      const fechaReferencia = obtenerFechaReferenciaCobranza(venta, ultimoPago)
      const fechaUltimoMovimiento = obtenerFechaUltimoMovimiento(venta, ultimoPago)

      if (!fechaReferencia) return null

      const diasAtraso = diferenciaEnDias(fechaReferencia, new Date())
      const limiteCritico = LIMITE_CRITICO[venta.frecuencia_pago] ?? 9999

      if (diasAtraso < limiteCritico) return null

      return {
        id: venta.id,
        numero_contrato: venta.numero_contrato,
        cliente: venta.cliente || `${venta.nombre} ${venta.apellido}`,
        direccion: venta.direccion,
        zona: venta.zona,
        cobrador_nombre: venta.cobrador_nombre,
        saldo_pendiente: Number(venta.saldo_pendiente || 0),
        frecuencia_pago: venta.frecuencia_pago,
        dias_atraso: diasAtraso,
        atraso_texto: formatearAtrasoSegunFrecuencia(
          diasAtraso,
          venta.frecuencia_pago,
          fechaReferencia
        ),
        fecha_ultimo_movimiento: fechaUltimoMovimiento,
        severidad: diasAtraso - limiteCritico,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.severidad !== a.severidad) return b.severidad - a.severidad
      if (b.saldo_pendiente !== a.saldo_pendiente) {
        return b.saldo_pendiente - a.saldo_pendiente
      }
      return String(a.numero_contrato).localeCompare(String(b.numero_contrato))
    })

  const resumenClientesCriticos = {
    total: clientesCriticos.length,
    saldoTotal: clientesCriticos.reduce(
      (total, cliente) => total + cliente.saldo_pendiente,
      0
    ),
    cobradoresComprometidos: new Set(
      clientesCriticos.map((cliente) => cliente.cobrador_nombre).filter(Boolean)
    ).size,
    top: clientesCriticos.slice(0, 5),
    lista: clientesCriticos,
  }

  return {
    ventasActivas,
    clientesPorZona,
    clientesPorCobrador,
    canceladasPorCobrador,
    contratosPrimerCobroPeriodo,
    primerosCobrosPorCobrador,
    contratosPendientesProgramacion,
    resumenClientesCriticos,
  }
}

export const exportarClientesCriticosExcel = (clientesCriticos) => {
  if (!Array.isArray(clientesCriticos) || clientesCriticos.length === 0) {
    return false
  }

  const data = clientesCriticos.map((cliente, index) => ({
    Prioridad: index + 1,
    Contrato: cliente.numero_contrato,
    Cliente: cliente.cliente,
    Cobrador: cliente.cobrador_nombre || "Sin asignar",
    Zona: cliente.zona,
    Direccion: cliente.direccion || "",
    "Ultimo movimiento": cliente.fecha_ultimo_movimiento
      ? formatearFechaDashboard(cliente.fecha_ultimo_movimiento)
      : "Sin pagos",
    Atraso: cliente.atraso_texto,
    "Saldo pendiente": cliente.saldo_pendiente.toFixed(2),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes Criticos")
  XLSX.writeFile(workbook, "clientes_criticos_dashboard.xlsx")
  return true
}
