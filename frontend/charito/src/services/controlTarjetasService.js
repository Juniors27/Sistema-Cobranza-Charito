import { API } from "@/src/config/api"

export const getControlTarjetas = async ({
  page = 1,
  pageSize = 10,
  lote = "",
  numeroContrato = "",
  nombreCliente = "",
  filtro = "todos",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    filtro,
  })

  if (lote) params.append("lote", lote)
  if (numeroContrato) params.append("numero_contrato", numeroContrato)
  if (nombreCliente) params.append("nombre_cliente", nombreCliente)

  const res = await fetch(`${API.ventas.controlTarjetas}?${params.toString()}`)

  if (!res.ok) {
    throw new Error("Error obteniendo control de tarjetas")
  }

  return res.json()
}

export const getTodasControlTarjetas = async ({
  lote = "",
  numeroContrato = "",
  nombreCliente = "",
  filtro = "todos",
} = {}) => {
  const pageSize = 100
  let page = 1
  let total = 0
  const results = []

  do {
    const data = await getControlTarjetas({
      page,
      pageSize,
      lote,
      numeroContrato,
      nombreCliente,
      filtro,
    })
    const pageResults = Array.isArray(data.results) ? data.results : []

    results.push(...pageResults)
    total = Number(data.count || results.length)

    if (pageResults.length === 0) break
    page += 1
  } while (results.length < total)

  return results
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
