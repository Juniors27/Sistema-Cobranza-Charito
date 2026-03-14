import { API } from "@/src/config/api"


export const clientesService = {
  async listar({ page = 1, pageSize = 10, search = "", zona = "todas" } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    })

    if (search) params.append("search", search)
    if (zona && zona !== "todas") params.append("zona", zona)

    const response = await fetch(`${API.clientes.lista}?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Error al listar clientes")
    }

    return response.json()
  },

 
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

export const exportarClientesFiltradosService = async ({
  search = "",
  zona = "todas",
} = {}) => {
  const params = new URLSearchParams({
    page: "1",
    page_size: "5000",
  })

  if (search) params.append("search", search)
  if (zona && zona !== "todas") params.append("zona", zona)

  const response = await fetch(`${API.clientes.lista}?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Error al exportar clientes")
  }

  const data = await response.json()
  return data.results || []
}
