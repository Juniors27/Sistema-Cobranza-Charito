// src/config/hooks/useDashboard.js
"use client"

import { useCallback, useEffect, useState } from "react"
import { dashboardService } from "@/src/services/dashboardService"
import { obtenerEtiquetaPeriodoDashboard } from "@/src/utils/dashboardUtils"
import { toast } from "sonner"

const metricasIniciales = {
  totalVentasActivas: 0,
  clientesPorZona: {
    milagro: 0,
    huanchaco: 0,
    buenosAires: 0,
  },
  clientesPorCobrador: [],
  canceladasPorCobrador: [],
  contratosPrimerCobroPeriodo: [],
  primerosCobrosPorCobrador: [],
  contratosPendientesProgramacion: [],
  resumenClientesCriticos: {
    total: 0,
    saldoTotal: 0,
    cobradoresComprometidos: 0,
    top: [],
    lista: [],
  },
}

export const useDashboard = () => {
  const [metricas, setMetricas] = useState(metricasIniciales)
  const [periodo, setPeriodo] = useState("semana_laboral")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guardandoProgramacionId, setGuardandoProgramacionId] = useState(null)

  const cargarDatos = useCallback(async (showToast = false, opciones = {}) => {
    setLoading(true)
    setError(null)

    try {
      const resumen = await dashboardService.getResumen(
        {
          periodo,
          fechaInicio,
          fechaFin,
        },
        opciones
      )

      setMetricas(resumen)

      if(showToast){
        toast.success("Dashboard actualizado correctamente")  
      }
      
    } catch (err) {
      setError(err.message)
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [fechaFin, fechaInicio, periodo])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const etiquetaPeriodo = obtenerEtiquetaPeriodoDashboard(
    periodo,
    fechaInicio,
    fechaFin
  )

  const actualizarVentaEnEstado = (ventaActualizada) => {
    if (ventaActualizada) {
      cargarDatos(false, { force: true })
    }
  }

  const guardarFechaPrimerCobro = async (ventaId, fechaPrimerCobro) => {
    try {
      setGuardandoProgramacionId(ventaId)
      const ventaActualizada = await dashboardService.actualizarProgramacionPrimerCobro(
        ventaId,
        { fecha_primer_cobro: fechaPrimerCobro }
      )

      actualizarVentaEnEstado(ventaActualizada)
      toast.success("Fecha de primer cobro guardada")
      return true
    } catch (err) {
      toast.error(err.message || "No se pudo guardar la fecha")
      return false
    } finally {
      setGuardandoProgramacionId(null)
    }
  }

  const marcarEntregaCobrador = async (ventaId, entregado) => {
    try {
      setGuardandoProgramacionId(ventaId)
      const ventaActualizada = await dashboardService.actualizarProgramacionPrimerCobro(
        ventaId,
        { entregado_cobrador: entregado }
      )

      actualizarVentaEnEstado(ventaActualizada)
      toast.success(
        entregado
          ? "Contrato marcado como entregado al cobrador"
          : "Entrega al cobrador revertida"
      )
      return true
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar la entrega")
      return false
    } finally {
      setGuardandoProgramacionId(null)
    }
  }

  return {
    ...metricas,
    ventasActivas: { length: metricas.totalVentasActivas || 0 },
    periodo,
    setPeriodo,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    etiquetaPeriodo,
    loading,
    error,
    cargarDatos: (showToast = false) => cargarDatos(showToast, { force: true }),
    guardandoProgramacionId,
    guardarFechaPrimerCobro,
    marcarEntregaCobrador,
  }
}
