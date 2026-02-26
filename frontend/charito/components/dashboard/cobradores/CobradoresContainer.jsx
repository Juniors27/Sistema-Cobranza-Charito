"use client"

import { useState, useCallback } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { useCobradores } from "@/src/hooks/useCobradores"
import { obtenerCantidadClientes } from "@/src/utils/cobradoresUtils"

import CobradorForm from "./CobradorForm"
import CobradoresList from "./CobradoresList"

const CobradoresContainer = () => {
  const {
    cobradores,
    ventas,
    loading,
    error,
    agregar,
    actualizar,
    eliminar,
  } = useCobradores()

  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    nombre: "",
    zona: "milagro",
  })

  const manejarGuardar = useCallback(async () => {
    if (!form.nombre.trim()) {
      toast.warning("Por favor completa el nombre")
      return
    }

    try {
      if (editando) {
        await actualizar(editando.id, form)
        toast.success("Cobrador actualizado correctamente")
        setEditando(null)
      } else {
        await agregar(form)
        toast.success("Cobrador agregado correctamente")
      }

      setForm({ nombre: "", zona: "milagro" })
    } catch {
      toast.error("Ocurrió un error al guardar")
    }
  }, [form, editando, agregar, actualizar])

  const manejarEditar = useCallback((cobrador) => {
    setEditando(cobrador)
    setForm({
      nombre: cobrador.nombre,
      zona: cobrador.zona,
    })
  }, [])

  const manejarEliminar = useCallback(async (id) => {
    try {
      await eliminar(id)
      toast.success("Cobrador eliminado correctamente")
    } catch {
      toast.error("No se pudo eliminar el cobrador")
    }
  }, [eliminar])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="ml-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <CobradorForm
            form={form}
            setForm={setForm}
            editando={editando}
            onGuardar={manejarGuardar}
            onCancelar={() => {
              setEditando(null)
              setForm({ nombre: "", zona: "milagro" })
            }}
          />

          <CobradoresList
            cobradores={cobradores}
            ventas={ventas}
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            obtenerCantidadClientes={obtenerCantidadClientes}
          />

        </div>
      </div>
    </div>
  )
}

export default CobradoresContainer