"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getVentasFiltradas } from "@/src/services/ventasService"
import { agruparProductos } from "@/src/utils/productosUtils"
import { obtenerMesActual, obtenerMesesRecientes } from "@/src/utils/ventasAnalyticsUtils"

export const useAnalyticsProductos = () => {
  const [filterType, setFilterType] = useState("mes")
  const [mesesDisponibles, setMesesDisponibles] = useState([])
  const [mesSeleccionado, setMesSeleccionado] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [filtroAplicado, setFiltroAplicado] = useState(false)

  useEffect(() => {
    const meses = obtenerMesesRecientes()
    const mesActual = obtenerMesActual()
    const mesInicial =
      meses.find((item) => item.value === mesActual)?.value || meses[0]?.value || ""

    setMesesDisponibles(meses)
    setMesSeleccionado(mesInicial)
  }, [])

  const aplicarFiltro = async () => {
    try {
      let data = []

      if (filterType === "mes") {
        if (!mesSeleccionado) {
          toast.warning("Selecciona un mes")
          return
        }

        data = await getVentasFiltradas({
          mes: mesSeleccionado,
          detallado: true,
          modulo: "dashboard",
        })
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
          fechaFin,
          detallado: true,
          modulo: "dashboard",
        })
      }

      if (!data.length) {
        setProductosFiltrados([])
        setFiltroAplicado(true)
        toast.info("No hay ventas en ese periodo")
        return
      }

      setProductosFiltrados(agruparProductos(data))
      setFiltroAplicado(true)
      toast.success("Filtro aplicado")
    } catch {
      toast.error("Error cargando ventas")
    }
  }

  const limpiarFiltro = () => {
    const mesActual = obtenerMesActual()
    const mesPorDefecto =
      mesesDisponibles.find((item) => item.value === mesActual)?.value ||
      mesesDisponibles[0]?.value ||
      ""

    setProductosFiltrados([])
    setFiltroAplicado(false)
    setFechaInicio("")
    setFechaFin("")
    setMesSeleccionado(mesPorDefecto)
    toast.info("Filtro limpiado")
  }

  const totalMonto = productosFiltrados.reduce((suma, producto) => suma + producto.precioTotal, 0)
  const totalCantidad = productosFiltrados.reduce((suma, producto) => suma + producto.cantidad, 0)

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
    totalCantidad,
  }
}
