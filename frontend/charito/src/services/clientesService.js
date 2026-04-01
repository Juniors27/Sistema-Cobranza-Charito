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


export const cambiarEstadoVentaService  = async (ventaId, payload) => {
  const body =
    typeof payload === "string"
      ? { estado: payload }
      : payload

  const response = await fetch(`${API.ventas.root}${ventaId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
  const params = new URLSearchParams()

  if (search) params.append("search", search)
  if (zona && zona !== "todas") params.append("zona", zona)

  const url = params.toString()
    ? `${API.clientes.exportar}?${params.toString()}`
    : API.clientes.exportar

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Error al exportar clientes")
  }

  return response.json()
}
