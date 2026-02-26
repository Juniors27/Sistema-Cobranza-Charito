import { API } from "@/src/config/api"


export const clientesService = {

 
  async actualizar(ventaId, datosActualizados) {
    const response = await fetch(`${API.ventas.root}${ventaId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosActualizados),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData?.detail || "Error al actualizar la venta")
    }

    return await response.json()
  },

 
  async eliminar(ventaId) {
    const response = await fetch(`${API.ventas.root}${ventaId}/`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Error al eliminar la venta")
    }

    return true
  },

  
}


export const cambiarEstadoVentaService  = async (ventaId, nuevoEstado) => {
  const response = await fetch(`${API.ventas.root}${ventaId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estado: nuevoEstado }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.error || "No se pudo actualizar el estado"
    )
  }

  return data
}