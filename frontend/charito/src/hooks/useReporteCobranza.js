"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"

import { getReporteCobranza, getHistorialPagos } from "@/src/services/reporteService"
import { obtenerCobradores } from "@/src/services/cobradoresService"

export const useReporteCobranza = () => {

  const [tipoFecha, setTipoFecha] = useState("simple")
  const [cobradores, setCobradores] = useState([])
  const [pagosReporteFiltrados, setPagosReporteFiltrados] = useState([])
  const [filtrosAplicados, setFiltrosAplicados] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [historialPagos, setHistorialPagos] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

  const [filtros, setFiltros] = useState({
    fecha: "",
    fechaInicio: "",
    fechaFin: "",
    cobrador: "",
    zona: "",
  })

  /* =========================
     CARGA INICIAL
  ========================= */
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerCobradores()
        setCobradores(data)
      } catch (error) {
        toast.error("Error cargando cobradores")
      }
    }

    cargar()
  }, [])

  /* =========================
     FILTROS
  ========================= */
  const handleFiltroChange = (e) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  const aplicarFiltros = async () => {
    try {
      const data = await getReporteCobranza({
        tipoFecha,
        ...filtros,
      })

     // console.log("RESPUESTA BACKEND:", data)

      setPagosReporteFiltrados(data)
      setFiltrosAplicados(true)

      toast.success("Filtros aplicados correctamente")
    } catch (error) {
      console.log("ERROR REAL:", error) 
      toast.error("Error aplicando filtros")
      setPagosReporteFiltrados([])
      setFiltrosAplicados(false)
    }
  }

  const limpiarFiltros = () => {
    setFiltros({
      fecha: "",
      fechaInicio: "",
      fechaFin: "",
      cobrador: "",
      zona: "",
    })
    setPagosReporteFiltrados([])
    setFiltrosAplicados(false)
    setSearchTerm("")
  }

  const pagosReporteVisibles = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    const pagosFiltrados = pagosReporteFiltrados.filter((pago) => {
      if (!search) return true

      return (
        pago.numeroContrato?.toLowerCase().includes(search) ||
        pago.cliente?.toLowerCase().includes(search)
      )
    })

    return [...pagosFiltrados].sort((a, b) => {
      const aCancelado = a.estado === "cancelado" || Number(a.saldo_pendiente) === 0
      const bCancelado = b.estado === "cancelado" || Number(b.saldo_pendiente) === 0

      if (aCancelado === bCancelado) return 0
      return aCancelado ? -1 : 1
    })
  }, [pagosReporteFiltrados, searchTerm])

  /* =========================
     HISTORIAL
  ========================= */
  const cargarHistorial = async (ventaId) => {
    setCargandoHistorial(true)
    try {
      const data = await getHistorialPagos(ventaId)
      console.log("RESPUESTA BACKEND:", data)
      setHistorialPagos(data)
    } catch (error) {
      toast.error("Error cargando historial")
      setHistorialPagos([])
    } finally {
      setCargandoHistorial(false)
    }
  }

  const abrirModal = async (pago) => {
    setPagoSeleccionado(pago)
    setModalAbierto(true)

    if (pago.venta_id) {
      await cargarHistorial(pago.venta_id)
    }
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setPagoSeleccionado(null)
    setHistorialPagos([])
  }

  return {
    tipoFecha,
    setTipoFecha,
    cobradores,
    pagosReporteFiltrados,
    pagosReporteVisibles,
    filtrosAplicados,
    searchTerm,
    historialPagos,
    cargandoHistorial,
    modalAbierto,
    pagoSeleccionado,
    filtros,
    setSearchTerm,
    handleFiltroChange,
    aplicarFiltros,
    limpiarFiltros,
    abrirModal,
    cerrarModal,
    cargarHistorial,
  }
}
