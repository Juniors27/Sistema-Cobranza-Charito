// src/config/hooks/useDashboard.js
"use client"

import { useEffect, useState } from "react"
import { dashboardService } from "@/src/services/dashboardService"
import { calcularMetricasDashboard } from "@/src/utils/dashboardUtils"
import { toast } from "sonner"

export const useDashboard = () => {
  const [ventas, setVentas] = useState([])
  const [cobradores, setCobradores] = useState([])
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

      setVentas(ventasData)
      setCobradores(cobradoresData)

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

  const metricas = calcularMetricasDashboard(ventas, cobradores)

  return {
    ...metricas,
    loading,
    error,
    cargarDatos,
  }
}
