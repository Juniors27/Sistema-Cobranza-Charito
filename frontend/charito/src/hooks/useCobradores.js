import { useState, useEffect } from "react"
import {
  obtenerCobradores,
  crearCobrador,
  actualizarCobrador,
  eliminarCobradorService,
} from "@/src/services/cobradoresService"

export const useCobradores = () => {
  const [cobradores, setCobradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)

    try {
      const cobradoresData = await obtenerCobradores()

      setCobradores(cobradoresData)
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
    loading,
    error,
    agregar,
    actualizar,
    eliminar,
    cargarDatos,
  }
}
