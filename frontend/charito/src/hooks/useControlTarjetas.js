import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  editarObservacionControl,
  eliminarObservacionControl,
  getControlTarjetas,
  getObservacionesControl,
  registrarObservacionControl,
} from "../services/controlTarjetasService"

import { controlTarjetasExcel as exportarControlTarjetasExcel } from "@/src/utils/controlTarjetasUtils"

export const useControlTarjetas = () => {
  const [ventasFiltradas, setVentasFiltradas] = useState([])
  const [conteos, setConteos] = useState({
    todos: 0,
    controlar: 0,
    buenos: 0,
    promesas_vencidas: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState("todos")
  const [paginaActual, setPaginaActual] = useState(1)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [modalObservacionesAbierto, setModalObservacionesAbierto] = useState(false)
  const [ventaObservaciones, setVentaObservaciones] = useState(null)
  const [observacionesControl, setObservacionesControl] = useState([])
  const [cargandoObservaciones, setCargandoObservaciones] = useState(false)
  const [guardandoObservacion, setGuardandoObservacion] = useState(false)
  const [editandoObservacionId, setEditandoObservacionId] = useState(null)
  const [formObservacion, setFormObservacion] = useState({
    fecha_control: "",
    tipo_resultado: "promesa_pago",
    observacion: "",
    fecha_compromiso_pago: "",
  })

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getControlTarjetas({
        page: paginaActual,
        pageSize: registrosPorPagina,
        search: searchTerm,
        filtro,
      })

      setVentasFiltradas(Array.isArray(data.results) ? data.results : [])
      setConteos(
        data.conteos || {
          todos: 0,
          controlar: 0,
          buenos: 0,
          promesas_vencidas: 0,
        }
      )
      setTotalRegistros(Number(data.count || 0))
      setTotalPaginas(Math.max(1, Math.ceil(Number(data.count || 0) / registrosPorPagina)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [paginaActual, registrosPorPagina, searchTerm, filtro])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  useEffect(() => {
    setPaginaActual(1)
  }, [searchTerm, filtro])

  const abrirModalObservaciones = async (venta) => {
    try {
      setVentaObservaciones(venta)
      setModalObservacionesAbierto(true)
      setObservacionesControl([])
      setCargandoObservaciones(true)
      setFormObservacion({
        fecha_control: new Date().toISOString().split("T")[0],
        tipo_resultado: "promesa_pago",
        observacion: "",
        fecha_compromiso_pago: "",
      })
      setEditandoObservacionId(null)

      const data = await getObservacionesControl(venta.id)
      setObservacionesControl(data)
    } catch (err) {
      toast.error(err.message || "No se pudo cargar el historial de observaciones")
    } finally {
      setCargandoObservaciones(false)
    }
  }

  const cerrarModalObservaciones = () => {
    setModalObservacionesAbierto(false)
    setVentaObservaciones(null)
    setObservacionesControl([])
    setEditandoObservacionId(null)
    setFormObservacion({
      fecha_control: "",
      tipo_resultado: "promesa_pago",
      observacion: "",
      fecha_compromiso_pago: "",
    })
  }

  const refrescarModalObservaciones = async (ventaId) => {
    const data = await getObservacionesControl(ventaId)
    setObservacionesControl(data)
  }

  const guardarObservacion = async () => {
    if (!ventaObservaciones) return
    if (!formObservacion.fecha_control || !formObservacion.observacion.trim()) {
      toast.error("Completa la fecha de control y la observacion")
      return
    }

    try {
      setGuardandoObservacion(true)
      const payload = {
        ...formObservacion,
        observacion: formObservacion.observacion.trim(),
        fecha_compromiso_pago: formObservacion.fecha_compromiso_pago || null,
      }

      if (editandoObservacionId) {
        await editarObservacionControl(editandoObservacionId, payload)
      } else {
        await registrarObservacionControl(ventaObservaciones.id, payload)
      }

      await Promise.all([refrescarModalObservaciones(ventaObservaciones.id), cargarDatos()])

      setFormObservacion((prev) => ({
        ...prev,
        observacion: "",
        fecha_compromiso_pago: "",
      }))
      setEditandoObservacionId(null)
      toast.success(
        editandoObservacionId
          ? "Observacion actualizada correctamente"
          : "Observacion registrada correctamente"
      )
    } catch (err) {
      toast.error(err.message || "No se pudo registrar la observacion")
    } finally {
      setGuardandoObservacion(false)
    }
  }

  const iniciarEdicionObservacion = (observacion) => {
    setEditandoObservacionId(observacion.id)
    setFormObservacion({
      fecha_control: observacion.fecha_control || "",
      tipo_resultado: observacion.tipo_resultado || "promesa_pago",
      observacion: observacion.observacion || "",
      fecha_compromiso_pago: observacion.fecha_compromiso_pago || "",
    })
  }

  const cancelarEdicionObservacion = () => {
    setEditandoObservacionId(null)
    setFormObservacion((prev) => ({
      ...prev,
      fecha_control: new Date().toISOString().split("T")[0],
      tipo_resultado: "promesa_pago",
      observacion: "",
      fecha_compromiso_pago: "",
    }))
  }

  const borrarObservacion = async (observacionId) => {
    try {
      await eliminarObservacionControl(observacionId)
      await Promise.all([refrescarModalObservaciones(ventaObservaciones.id), cargarDatos()])

      if (editandoObservacionId === observacionId) {
        cancelarEdicionObservacion()
      }

      toast.success("Observacion eliminada correctamente")
    } catch (err) {
      toast.error(err.message || "No se pudo eliminar la observacion")
    }
  }

  const controlTarjetasExcel = async () => {
    try {
      const data = await getControlTarjetas({
        page: 1,
        pageSize: 5000,
        search: searchTerm,
        filtro,
      })
      exportarControlTarjetasExcel(data.results || [])
    } catch (err) {
      toast.error(err.message || "No se pudo exportar el control")
    }
  }

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

  return {
    ventasFiltradas,
    datosPaginados: ventasFiltradas,
    clientesControlar: Array.from({ length: conteos.controlar }),
    buenosPagadores: Array.from({ length: conteos.buenos }),
    clientesPromesaVencida: Array.from({ length: conteos.promesas_vencidas }),
    conteos,
    loading,
    error,
    searchTerm,
    filtro,
    modalObservacionesAbierto,
    ventaObservaciones,
    observacionesControl,
    cargandoObservaciones,
    guardandoObservacion,
    editandoObservacionId,
    formObservacion,
    controlTarjetasExcel,
    cargarDatos,
    abrirModalObservaciones,
    cerrarModalObservaciones,
    guardarObservacion,
    iniciarEdicionObservacion,
    cancelarEdicionObservacion,
    borrarObservacion,
    setSearchTerm,
    setFiltro,
    setFormObservacion,
    paginaActual,
    totalPaginas,
    registrosPorPagina,
    indiceInicio,
    indiceFin,
    totalRegistros,
    paginaAnterior,
    cambiarRegistrosPorPagina,
    paginaSiguiente,
    irAPagina,
  }
}
