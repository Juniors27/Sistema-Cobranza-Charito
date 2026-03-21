import { API } from "@/src/config/api"

export const getControlTarjetas = async ({
  page = 1,
  pageSize = 10,
  search = "",
  filtro = "todos",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    filtro,
  })

  if (search) {
    params.append("search", search)
  }

  const res = await fetch(`${API.ventas.controlTarjetas}?${params.toString()}`)

  if (!res.ok) {
    throw new Error("Error obteniendo control de tarjetas")
  }

  return res.json()
}


/* =========================
   OBTENER PAGOS
========================= */
export const getPagos = async () => {
  const res = await fetch(`${API.pagos.lista}`)

  if (!res.ok) {
    throw new Error("Error obteniendo pagos")
  }

  return res.json()
}

export const getObservacionesControl = async (ventaId) => {
  const res = await fetch(API.control.observaciones(ventaId))

  if (!res.ok) {
    throw new Error("Error obteniendo observaciones del control")
  }

  return res.json()
}

export const getTodasObservacionesControl = async () => {
  const res = await fetch(API.control.observacionesLista)

  if (!res.ok) {
    throw new Error("Error obteniendo historial de observaciones")
  }

  return res.json()
}

export const registrarObservacionControl = async (ventaId, payload) => {
  const res = await fetch(API.control.observaciones(ventaId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data?.detail ||
      data?.observacion?.[0] ||
      data?.fecha_compromiso_pago?.[0] ||
      "Error registrando observacion"
    )
  }

  return data
}

export const editarObservacionControl = async (observacionId, payload) => {
  const res = await fetch(API.control.observacionDetalle(observacionId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data?.detail ||
      data?.observacion?.[0] ||
      data?.fecha_compromiso_pago?.[0] ||
      "Error editando observacion"
    )
  }

  return data
}

export const eliminarObservacionControl = async (observacionId) => {
  const res = await fetch(API.control.observacionDetalle(observacionId), {
    method: "DELETE",
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.detail || "Error eliminando observacion")
  }

  return data
}
