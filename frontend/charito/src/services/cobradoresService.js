import { API } from "@/src/config/api"
import { obtenerJsonCacheado } from "@/src/utils/requestCache"

const COBRADORES_CACHE_TTL = 60_000

export const obtenerCobradores = async () => {
  return obtenerJsonCacheado({
    key: "cobradores:lista",
    ttlMs: COBRADORES_CACHE_TTL,
    fetcher: async () => {
      const res = await fetch(API.cobradores.lista)

      if (!res.ok) {
        throw new Error("Error al obtener cobradores")
      }

      return res.json()
    },
  })
}

export const crearCobrador = async (data) => {
  const res = await fetch(API.cobradores.root, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Error al crear cobrador")
  }

  return res.json()
}

export const actualizarCobrador = async (id, data) => {
  const res = await fetch(`${API.cobradores.root}${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Error al actualizar cobrador")
  }

  return res.json()
}

export const eliminarCobradorService = async (id) => {
  const res = await fetch(`${API.cobradores.root}${id}/`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Error al eliminar cobrador")
  }
}
