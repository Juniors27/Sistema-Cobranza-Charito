import { API } from "@/src/config/api"

/* =========================
   OBTENER TODAS LAS VENTAS
========================= */
export const getVentas = async () => {
  const res = await fetch(API.ventas.lista)

  if (!res.ok) {
    throw new Error("Error obteniendo ventas")
  }

  return res.json()
}

/* =========================
   OBTENER VENTAS FILTRADAS
========================= */
export const getVentasFiltradas = async ({ mes, fechaInicio, fechaFin }) => {
  let url = API.ventas.lista
  const params = new URLSearchParams()

  if (mes) params.append("mes", mes)
  if (fechaInicio && fechaFin) {
    params.append("fecha_inicio", fechaInicio)
    params.append("fecha_fin", fechaFin)
  }

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Error filtrando ventas")
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
    throw new Error(error?.detail || "Error al registrar venta")
  }

  return res.json()
}
