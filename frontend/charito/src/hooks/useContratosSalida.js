"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { dashboardService } from "@/src/services/dashboardService"
import { toast } from "sonner"

const PERIODOS = {
  semana_laboral: "semana_laboral",
  historico: "historico",
  rango: "rango",
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

export const useContratosSalida = () => {
  const [contratosSalida, setContratosSalida] = useState([])
  const [gruposPorCobrador, setGruposPorCobrador] = useState([])
  const [resumen, setResumen] = useState({
    total: 0,
    entregados: 0,
    yaPagaron: 0,
    pendientesPrimerPago: 0,
    saldoTotal: 0,
    cobradores: 0,
  })
  const [cobradores, setCobradores] = useState([])
  const [periodo, setPeriodo] = useState(PERIODOS.semana_laboral)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [cobradorFiltro, setCobradorFiltro] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [guardandoEntregaId, setGuardandoEntregaId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarCobradores = useCallback(async () => {
    const cobradoresData = await dashboardService.getCobradores()
    setCobradores(Array.isArray(cobradoresData) ? cobradoresData : [])
  }, [])

  const cargarDatos = useCallback(async (showToast = false) => {
    setLoading(true)
    setError(null)

    try {
      const respuesta = await dashboardService.getContratosSalida({
        periodo,
        fechaInicio,
        fechaFin,
        cobrador: cobradorFiltro,
        search: busqueda,
        page: paginaActual,
        pageSize: registrosPorPagina,
      })

      setContratosSalida(
        Array.isArray(respuesta.results)
          ? respuesta.results.map((contrato) => ({
              ...contrato,
              fecha_primer_pago: contrato.fecha_inicial || "",
            }))
          : []
      )
      setGruposPorCobrador(
        Array.isArray(respuesta.gruposPorCobrador) ? respuesta.gruposPorCobrador : []
      )
      setResumen(
        respuesta.resumen || {
          total: 0,
          entregados: 0,
          yaPagaron: 0,
          pendientesPrimerPago: 0,
          saldoTotal: 0,
          cobradores: 0,
        }
      )
      setTotalRegistros(Number(respuesta.count || 0))
      setTotalPaginas(Math.max(1, Math.ceil(Number(respuesta.count || 0) / registrosPorPagina)))

      if (showToast) {
        toast.success("Contratos de salida actualizados")
      }
    } catch (err) {
      setError(err.message)
      toast.error("Error al cargar contratos de salida")
    } finally {
      setLoading(false)
    }
  }, [periodo, fechaInicio, fechaFin, cobradorFiltro, busqueda, paginaActual, registrosPorPagina])

  useEffect(() => {
    cargarCobradores().catch(() => {})
  }, [cargarCobradores])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  useEffect(() => {
    setPaginaActual(1)
  }, [periodo, fechaInicio, fechaFin, cobradorFiltro, busqueda])

  const rangoSemanaLaboral = useMemo(() => obtenerSemanaLaboral(), [])

  const indiceInicio = totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina
  const indiceFin = indiceInicio + registrosPorPagina

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual((prev) => prev - 1)
  }

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual((prev) => prev + 1)
  }

  const irAPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero)
    }
  }

  const cambiarRegistrosPorPagina = (cantidad) => {
    setRegistrosPorPagina(cantidad)
    setPaginaActual(1)
  }

  const actualizarEntregaContrato = async (ventaId, data) => {
    try {
      setGuardandoEntregaId(ventaId)
      await dashboardService.actualizarProgramacionPrimerCobro(ventaId, data)
      await cargarDatos()
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
    contratosSalidaPaginados: contratosSalida,
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
    paginaActual,
    registrosPorPagina,
    totalRegistros,
    totalPaginas,
    indiceInicio,
    indiceFin,
    irAPagina,
    paginaAnterior,
    paginaSiguiente,
    cambiarRegistrosPorPagina,
    loading,
    error,
    cargarDatos,
  }
}
