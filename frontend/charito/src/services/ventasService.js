import { API } from "@/src/config/api"

/* =========================
   OBTENER TODAS LAS VENTAS
========================= */
export const getVentas = async ({ detallado = false, modulo = "" } = {}) => {
  const params = new URLSearchParams()

  if (detallado) params.append("detallado", "1")
  if (modulo) params.append("modulo", modulo)

  const url = params.toString()
    ? `${API.ventas.lista}?${params.toString()}`
    : API.ventas.lista
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Error obteniendo ventas")
  }

  return res.json()
}

/* =========================
   OBTENER VENTAS FILTRADAS
========================= */
export const getVentasFiltradas = async ({
  mes,
  fechaInicio,
  fechaFin,
  detallado = false,
  modulo = "",
}) => {
  let url = API.ventas.lista
  const params = new URLSearchParams()

  if (mes) params.append("mes", mes)
  if (fechaInicio && fechaFin) {
    params.append("fecha_inicio", fechaInicio)
    params.append("fecha_fin", fechaFin)
  }
  if (detallado) params.append("detallado", "1")
  if (modulo) params.append("modulo", modulo)

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Error filtrando ventas")
  }

  return res.json()
}

export const getVentaDetalle = async (ventaId) => {
  const res = await fetch(`${API.ventas.root}${ventaId}/`)

  if (!res.ok) {
    throw new Error("Error obteniendo detalle de la venta")
  }

  return res.json()
}

/* =========================
   VALIDAR CONTRATO
========================= */
export const validarContratoService = async (numeroContrato) => {
  const res = await fetch(`${API.ventas.root}validar/${numeroContrato}/`)

  if (!res.ok && res.status !== 409) {
    // Solo lanzamos error si NO es 409
    throw new Error("Error validando contrato")
  }

  // Retornamos true si existe (409), false si no
  return res.status === 409
}



/* =========================
   REGISTRAR VENTA
========================= */
export const registrarVentaService = async (data) => {
  const res = await fetch(API.ventas.root, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    const mensaje =
      error?.detail ||
      Object.entries(error || {})
        .map(([campo, mensajes]) => `${campo}: ${Array.isArray(mensajes) ? mensajes.join(", ") : mensajes}`)
        .join(" | ")

    throw new Error(mensaje || "Error al registrar venta")
  }

  return res.json()
}
