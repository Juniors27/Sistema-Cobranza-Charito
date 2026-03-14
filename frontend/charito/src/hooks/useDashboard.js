// src/config/hooks/useDashboard.js
"use client"

import { useEffect, useMemo, useState } from "react"
import { dashboardService } from "@/src/services/dashboardService"
import {
  calcularMetricasDashboard,
  obtenerEtiquetaPeriodoDashboard,
} from "@/src/utils/dashboardUtils"
import { toast } from "sonner"

export const useDashboard = () => {
  const [ventas, setVentas] = useState([])
  const [cobradores, setCobradores] = useState([])
  const [pagos, setPagos] = useState([])
  const [periodo, setPeriodo] = useState("semana_laboral")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guardandoProgramacionId, setGuardandoProgramacionId] = useState(null)

  const cargarDatos = async (showToast = false) => {
    setLoading(true)
    setError(null)

    try {
      const [ventasData, cobradoresData, pagosData] = await Promise.all([
        dashboardService.getVentas(),
        dashboardService.getCobradores(),
        dashboardService.getPagos(),
      ])

      setVentas(ventasData)
      setCobradores(cobradoresData)
      setPagos(pagosData)

      if(showToast){
        toast.success("Dashboard actualizado correctamente")  
      }
      
    } catch (err) {
      setError(err.message)
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const metricas = useMemo(
    () =>
      calcularMetricasDashboard(
        ventas,
        cobradores,
        pagos,
        periodo,
        fechaInicio,
        fechaFin
      ),
    [ventas, cobradores, pagos, periodo, fechaInicio, fechaFin]
  )

  const etiquetaPeriodo = obtenerEtiquetaPeriodoDashboard(
    periodo,
    fechaInicio,
    fechaFin
  )

  const actualizarVentaEnEstado = (ventaActualizada) => {
    setVentas((prevVentas) =>
      prevVentas.map((venta) =>
        venta.id === ventaActualizada.id ? { ...venta, ...ventaActualizada } : venta
      )
    )
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
    periodo,
    setPeriodo,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    etiquetaPeriodo,
    loading,
    error,
    cargarDatos,
    guardandoProgramacionId,
    guardarFechaPrimerCobro,
    marcarEntregaCobrador,
  }
}
