"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

import { getReporteCobranza, getHistorialPagos } from "@/src/services/reporteService"
import { obtenerCobradores } from "@/src/services/cobradoresService"

export const useReporteCobranza = () => {

  const [tipoFecha, setTipoFecha] = useState("simple")
  const [cobradores, setCobradores] = useState([])
  const [pagosReporteFiltrados, setPagosReporteFiltrados] = useState([])
  const [filtrosAplicados, setFiltrosAplicados] = useState(false)

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
  }

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
    filtrosAplicados,
    historialPagos,
    cargandoHistorial,
    modalAbierto,
    pagoSeleccionado,
    filtros,
    handleFiltroChange,
    aplicarFiltros,
    limpiarFiltros,
    abrirModal,
    cerrarModal,
    cargarHistorial,
  }
}
