"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { getVentas, getVentasFiltradas } from "@/src/services/ventasService"
import {
  agruparVentasPorFecha,
  construirDescripcionPeriodo,
  obtenerFechaActual,
  obtenerMesActual,
  obtenerMesesDisponibles,
  resumirVentas,
} from "@/src/utils/ventasAnalyticsUtils"

const FILTER_TYPES = {
  mes: "mes",
  fecha: "fecha",
  rango: "rango",
}

const consultarVentasFiltradas = async ({
  currentFilterType,
  currentMes,
  currentFecha,
  currentFechaInicio,
  currentFechaFin,
}) => {
  if (currentFilterType === FILTER_TYPES.mes) {
    return getVentasFiltradas({ mes: currentMes })
  }

  if (currentFilterType === FILTER_TYPES.fecha) {
    return getVentasFiltradas({
      fechaInicio: currentFecha,
      fechaFin: currentFecha,
    })
  }

  return getVentasFiltradas({
    fechaInicio: currentFechaInicio,
    fechaFin: currentFechaFin,
  })
}

export const useVentasAnalytics = () => {
  const [filterType, setFilterType] = useState(FILTER_TYPES.mes)
  const [mesesDisponibles, setMesesDisponibles] = useState([])
  const [cobradoresDisponibles, setCobradoresDisponibles] = useState([])
  const [cobradorSeleccionado, setCobradorSeleccionado] = useState("")
  const [mesSeleccionado, setMesSeleccionado] = useState("")
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaActual())
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [ventasPeriodo, setVentasPeriodo] = useState([])
  const [filtroAplicado, setFiltroAplicado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingFiltro, setLoadingFiltro] = useState(false)
  const [error, setError] = useState("")

  const filtrarPorCobrador = useCallback(
    (ventas, cobradorActual = cobradorSeleccionado) => {
      if (!cobradorActual) return ventas

      return ventas.filter(
        (venta) =>
          String(venta.cobrador ?? "") === String(cobradorActual) ||
          String(venta.cobrador_nombre ?? "") === String(cobradorActual)
      )
    },
    [cobradorSeleccionado]
  )

  const aplicarFiltro = async (configuracion) => {
    const {
      currentFilterType = filterType,
      currentMes = mesSeleccionado,
      currentFecha = fechaSeleccionada,
      currentFechaInicio = fechaInicio,
      currentFechaFin = fechaFin,
      currentCobrador = cobradorSeleccionado,
      silent = false,
    } = configuracion || {}

    if (currentFilterType === FILTER_TYPES.mes && !currentMes) {
      toast.warning("Selecciona un mes")
      return false
    }

    if (currentFilterType === FILTER_TYPES.fecha && !currentFecha) {
      toast.warning("Selecciona una fecha")
      return false
    }

    if (currentFilterType === FILTER_TYPES.rango) {
      if (!currentFechaInicio || !currentFechaFin) {
        toast.warning("Selecciona ambas fechas")
        return false
      }

      if (currentFechaInicio > currentFechaFin) {
        toast.error("La fecha inicio no puede ser mayor que la fecha fin")
        return false
      }
    }

    setLoadingFiltro(true)
    setError("")

    try {
      // La API ya soporta filtros por mes y rango; para fecha puntual usamos rango de un solo día.
      const data = await consultarVentasFiltradas({
        currentFilterType,
        currentMes,
        currentFecha,
        currentFechaInicio,
        currentFechaFin,
      })

      setVentasPeriodo(data)
      setCobradorSeleccionado(currentCobrador)
      setFiltroAplicado(true)

      if (!silent) {
        toast.success("Reporte de ventas actualizado")
      }

      return true
    } catch (filtroError) {
      const mensaje = "No se pudo cargar el reporte de ventas"
      setError(mensaje)
      toast.error(mensaje)
      return false
    } finally {
      setLoadingFiltro(false)
    }
  }

  useEffect(() => {
    const cargarModulo = async () => {
      setLoading(true)
      setError("")

    try {
        // Para poblar meses y cobradores no necesitamos el listado pesado con subconsultas.
        const ventas = await getVentas({ modulo: "dashboard" })
        const meses = obtenerMesesDisponibles(ventas)
        const cobradores = Array.from(
          new Map(
            ventas
              .filter((venta) => venta.cobrador || venta.cobrador_nombre)
              .map((venta) => [
                String(venta.cobrador ?? venta.cobrador_nombre),
                {
                  value: String(venta.cobrador ?? venta.cobrador_nombre),
                  label: venta.cobrador_nombre || `Cobrador ${venta.cobrador}`,
                },
              ])
          ).values()
        ).sort((a, b) => a.label.localeCompare(b.label, "es"))
        const mesActual = obtenerMesActual()
        const mesInicial =
          meses.find((item) => item.value === mesActual)?.value || meses[0]?.value || ""

        setMesesDisponibles(meses)
        setCobradoresDisponibles(cobradores)
        setMesSeleccionado(mesInicial)

        setVentasPeriodo([])
        setFiltroAplicado(false)
      } catch (cargaError) {
        setError("No se pudo cargar el módulo de reporte de ventas")
      } finally {
        setLoading(false)
      }
    }

    cargarModulo()
  }, [])

  const limpiarFiltro = () => {
    const mesActual = obtenerMesActual()
    const mesPorDefecto =
      mesesDisponibles.find((item) => item.value === mesActual)?.value ||
      mesesDisponibles[0]?.value ||
      ""

    setFilterType(FILTER_TYPES.mes)
    setCobradorSeleccionado("")
    setMesSeleccionado(mesPorDefecto)
    setFechaSeleccionada(obtenerFechaActual())
    setFechaInicio("")
    setFechaFin("")

    setVentasPeriodo([])
    setFiltroAplicado(false)
  }

  const ventasFiltradas = useMemo(
    () => filtrarPorCobrador(ventasPeriodo),
    [ventasPeriodo, filtrarPorCobrador]
  )
  const resumen = useMemo(() => resumirVentas(ventasFiltradas), [ventasFiltradas])
  const ventasPorFecha = useMemo(
    () => agruparVentasPorFecha(ventasFiltradas),
    [ventasFiltradas]
  )
  const descripcionPeriodo = useMemo(
    () =>
      construirDescripcionPeriodo({
        filterType,
        mesSeleccionado,
        fechaSeleccionada,
        fechaInicio,
        fechaFin,
        cobradorSeleccionado:
          cobradoresDisponibles.find((item) => item.value === cobradorSeleccionado)?.label || "",
        filtroAplicado,
      }),
    [
      filterType,
      mesSeleccionado,
      fechaSeleccionada,
      fechaInicio,
      fechaFin,
      cobradorSeleccionado,
      cobradoresDisponibles,
      filtroAplicado,
    ]
  )

  return {
    filterType,
    setFilterType,
    mesesDisponibles,
    cobradoresDisponibles,
    cobradorSeleccionado,
    setCobradorSeleccionado,
    mesSeleccionado,
    setMesSeleccionado,
    fechaSeleccionada,
    setFechaSeleccionada,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    ventasFiltradas,
    ventasPorFecha,
    filtroAplicado,
    loading,
    loadingFiltro,
    error,
    aplicarFiltro,
    limpiarFiltro,
    descripcionPeriodo,
    ...resumen,
  }
}
