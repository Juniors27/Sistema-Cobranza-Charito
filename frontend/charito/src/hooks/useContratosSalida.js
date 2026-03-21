"use client"

import { useEffect, useMemo, useState } from "react"
import { dashboardService } from "@/src/services/dashboardService"
import { toast } from "sonner"

const PERIODOS = {
  semana_laboral: "semana_laboral",
  historico: "historico",
  rango: "rango",
}

const normalizarFecha = (fecha) => {
  if (!fecha) return null

  const [year, month, day] = String(fecha).slice(0, 10).split("-")
  if (!year || !month || !day) return null

  const date = new Date(Number(year), Number(month) - 1, Number(day))
  date.setHours(0, 0, 0, 0)

  return Number.isNaN(date.getTime()) ? null : date
}

const obtenerSemanaLaboral = (referencia = new Date()) => {
  const base = new Date(referencia)
  base.setHours(0, 0, 0, 0)

  const inicioSemana = new Date(base)
  const diaSemana = base.getDay()

  if (diaSemana === 6) {
    inicioSemana.setDate(base.getDate() + 1)
  } else {
    inicioSemana.setDate(base.getDate() - diaSemana)
  }

  const finSemanaLaboral = new Date(inicioSemana)
  finSemanaLaboral.setDate(inicioSemana.getDate() + 3)

  return {
    inicio: inicioSemana,
    fin: finSemanaLaboral,
  }
}

const fechaEnPeriodo = (fecha, periodo, fechaInicio, fechaFin, referencia = new Date()) => {
  const fechaBase = normalizarFecha(fecha)
  if (!fechaBase) return false

  if (periodo === PERIODOS.historico) return true

  if (periodo === PERIODOS.semana_laboral) {
    const { inicio, fin } = obtenerSemanaLaboral(referencia)
    return fechaBase >= inicio && fechaBase <= fin
  }

  if (periodo === PERIODOS.rango) {
    const inicio = normalizarFecha(fechaInicio)
    const fin = normalizarFecha(fechaFin)
    if (!inicio || !fin) return false
    return fechaBase >= inicio && fechaBase <= fin
  }

  return true
}

const ordenarPorFechaDesc = (fechaA, fechaB) => {
  const dateA = normalizarFecha(fechaA)
  const dateB = normalizarFecha(fechaB)

  if (!dateA && !dateB) return 0
  if (!dateA) return 1
  if (!dateB) return -1

  return dateB - dateA
}

export const useContratosSalida = () => {
  const [ventas, setVentas] = useState([])
  const [cobradores, setCobradores] = useState([])
  const [periodo, setPeriodo] = useState(PERIODOS.semana_laboral)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [cobradorFiltro, setCobradorFiltro] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [guardandoEntregaId, setGuardandoEntregaId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = async (showToast = false) => {
    setLoading(true)
    setError(null)

    try {
      const [ventasData, cobradoresData] = await Promise.all([
        dashboardService.getVentas(),
        dashboardService.getCobradores(),
      ])

      setVentas(Array.isArray(ventasData) ? ventasData : [])
      setCobradores(Array.isArray(cobradoresData) ? cobradoresData : [])

      if (showToast) {
        toast.success("Contratos de salida actualizados")
      }
    } catch (err) {
      setError(err.message)
      toast.error("Error al cargar contratos de salida")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const contratosSalida = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return ventas
      .filter((venta) => Number(venta.inicial || 0) <= 0)
      .filter((venta) => Boolean(venta.fecha_primer_cobro))
      .filter((venta) =>
        fechaEnPeriodo(venta.fecha_primer_cobro, periodo, fechaInicio, fechaFin)
      )
      .filter((venta) =>
        cobradorFiltro === "todos" ? true : String(venta.cobrador) === cobradorFiltro
      )
      .filter((venta) => {
        if (!termino) return true

        const contenido = [
          venta.numero_contrato,
          venta.cliente,
          venta.nombre,
          venta.apellido,
          venta.cobrador_nombre,
          venta.zona,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return contenido.includes(termino)
      })
      .map((venta) => ({
        id: venta.id,
        numero_contrato: venta.numero_contrato,
        cliente: venta.cliente || `${venta.nombre} ${venta.apellido}`.trim(),
        cobrador: venta.cobrador,
        cobrador_nombre: venta.cobrador_nombre || "Sin cobrador",
        fecha_venta: venta.fecha_venta,
        fecha_primer_cobro: venta.fecha_primer_cobro,
        fecha_primer_pago: venta.fecha_inicial,
        entregado_cobrador: Boolean(venta.entregado_cobrador),
        fecha_entrega_cobrador: venta.fecha_entrega_cobrador,
        saldo_pendiente: Number(venta.saldo_pendiente || 0),
        primer_pago_registrado: Boolean(venta.primer_pago_registrado),
      }))
      .sort((a, b) => {
        const porFecha = ordenarPorFechaDesc(a.fecha_primer_cobro, b.fecha_primer_cobro)
        if (porFecha !== 0) return porFecha
        return String(a.numero_contrato).localeCompare(String(b.numero_contrato))
      })
  }, [ventas, periodo, fechaInicio, fechaFin, cobradorFiltro, busqueda])

  const resumen = useMemo(() => {
    const total = contratosSalida.length
    const entregados = contratosSalida.filter((venta) => venta.entregado_cobrador).length
    const yaPagaron = contratosSalida.filter((venta) => venta.primer_pago_registrado).length
    const pendientesPrimerPago = total - yaPagaron
    const saldoTotal = contratosSalida.reduce(
      (acumulado, venta) => acumulado + venta.saldo_pendiente,
      0
    )

    return {
      total,
      entregados,
      yaPagaron,
      pendientesPrimerPago,
      saldoTotal,
      cobradores: new Set(contratosSalida.map((venta) => venta.cobrador_nombre)).size,
    }
  }, [contratosSalida])

  const gruposPorCobrador = useMemo(() => {
    return cobradores
      .map((cobrador) => {
        const contratos = contratosSalida.filter((venta) => venta.cobrador === cobrador.id)

        return {
          id: cobrador.id,
          nombre: cobrador.nombre,
          zona: cobrador.zona,
          contratos,
          total: contratos.length,
          entregados: contratos.filter((venta) => venta.entregado_cobrador).length,
          yaPagaron: contratos.filter((venta) => venta.primer_pago_registrado).length,
          pendientes: contratos.filter((venta) => !venta.primer_pago_registrado).length,
        }
      })
      .filter((grupo) => grupo.total > 0)
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre))
  }, [cobradores, contratosSalida])

  const rangoSemanaLaboral = useMemo(
    () => obtenerSemanaLaboral(),
    []
  )

  const actualizarEntregaContrato = async (ventaId, data) => {
    try {
      setGuardandoEntregaId(ventaId)
      const ventaActualizada = await dashboardService.actualizarProgramacionPrimerCobro(
        ventaId,
        data
      )

      setVentas((prev) =>
        prev.map((venta) =>
          venta.id === ventaId ? { ...venta, ...ventaActualizada } : venta
        )
      )

      toast.success("Entrega actualizada")
      return true
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar la entrega")
      return false
    } finally {
      setGuardandoEntregaId(null)
    }
  }

  return {
    contratosSalida,
    gruposPorCobrador,
    resumen,
    cobradores,
    periodo,
    setPeriodo,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    cobradorFiltro,
    setCobradorFiltro,
    busqueda,
    setBusqueda,
    rangoSemanaLaboral,
    guardandoEntregaId,
    actualizarEntregaContrato,
    loading,
    error,
    cargarDatos,
  }
}
