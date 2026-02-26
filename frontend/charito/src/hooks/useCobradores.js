import { useState, useEffect } from "react"
import {
  obtenerCobradores,
  obtenerVentas,
  crearCobrador,
  actualizarCobrador,
  eliminarCobradorService,
} from "@/src/services/cobradoresService"
import { getVentas } from "../services/ventasService"

export const useCobradores = () => {
  const [cobradores, setCobradores] = useState([])
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)

    try {
      const [cobradoresData, ventasData] = await Promise.all([
        obtenerCobradores(),
        getVentas(),
      ])

      setCobradores(cobradoresData)
      setVentas(ventasData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const agregar = async (data) => {
    await crearCobrador(data)
    await cargarDatos()
  }

  const actualizar = async (id, data) => {
    await actualizarCobrador(id, data)
    await cargarDatos()
  }

  const eliminar = async (id) => {
    await eliminarCobradorService(id)
    await cargarDatos()
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return {
    cobradores,
    ventas,
    loading,
    error,
    agregar,
    actualizar,
    eliminar,
    cargarDatos,
  }
}
