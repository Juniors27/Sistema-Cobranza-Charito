"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getVentas, getVentasFiltradas } from "@/src/services/ventasService"
import {
  agruparProductos,
  obtenerMesesDisponibles
} from "@/src/utils/productosUtils"

export const useAnalyticsProductos = () => {
  const [filterType, setFilterType] = useState("mes")
  const [mesesDisponibles, setMesesDisponibles] = useState([])
  const [mesSeleccionado, setMesSeleccionado] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [filtroAplicado, setFiltroAplicado] = useState(false)

  /* =========================
     CARGAR MESES INICIALES
  ========================== */
  useEffect(() => {
    const cargarMeses = async () => {
      try {
        const ventas = await getVentas()
        const meses = obtenerMesesDisponibles(ventas)

        setMesesDisponibles(meses)
        setMesSeleccionado(meses[0]?.value || "")
      } catch {
        toast.error("Error cargando meses")
      }
    }

    cargarMeses()
  }, [])

  /* =========================
     APLICAR FILTRO
  ========================== */
  const aplicarFiltro = async () => {
    try {
      let data = []

      if (filterType === "mes") {
        if (!mesSeleccionado) {
          toast.warning("Selecciona un mes")
          return
        }

        data = await getVentasFiltradas({ mes: mesSeleccionado })
      }

      if (filterType === "rango") {
        if (!fechaInicio || !fechaFin) {
          toast.warning("Selecciona ambas fechas")
          return
        }

        if (fechaInicio > fechaFin) {
          toast.error("Fecha inicio no puede ser mayor")
          return
        }

        data = await getVentasFiltradas({
          fechaInicio,
          fechaFin
        })
      }

      if (!data.length) {
        setProductosFiltrados([])
        setFiltroAplicado(true)
        toast.info("No hay ventas en ese período")
        return
      }

      const productos = agruparProductos(data)

      setProductosFiltrados(productos)
      setFiltroAplicado(true)
      toast.success("Filtro aplicado")

    } catch {
      toast.error("Error cargando ventas")
    }
  }

  const limpiarFiltro = () => {
    setProductosFiltrados([])
    setFiltroAplicado(false)
    setFechaInicio("")
    setFechaFin("")
    setMesSeleccionado(mesesDisponibles[0]?.value || "")
    toast.info("Filtro limpiado")
  }

  const totalMonto = productosFiltrados.reduce(
    (s, p) => s + p.precioTotal,
    0
  )

  const totalCantidad = productosFiltrados.reduce(
    (s, p) => s + p.cantidad,
    0
  )

  return {
    filterType,
    setFilterType,
    mesesDisponibles,
    mesSeleccionado,
    setMesSeleccionado,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    productosFiltrados,
    filtroAplicado,
    aplicarFiltro,
    limpiarFiltro,
    totalMonto,
    totalCantidad
  }
}
