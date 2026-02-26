import { API } from "@/src/config/api"



/* =========================
   OBTENER REPORTE COBRANZA
========================= */
export const getReporteCobranza = async (params) => {
  let url = API.reporte.cobranza
  const query = new URLSearchParams()

  if (params.tipoFecha === "simple" && params.fecha) {
    query.append("fecha", params.fecha)
  }

  if (
    params.tipoFecha === "rango" &&
    params.fechaInicio &&
    params.fechaFin
  ) {
    query.append("fecha_inicio", params.fechaInicio)
    query.append("fecha_fin", params.fechaFin)
  }

  if (params.cobrador) {
    query.append("cobrador", params.cobrador)
  }

  if (query.toString()) {
    url += `?${query.toString()}`
  }


  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok) {
    throw new Error("Error filtrando reporte de cobranza")
  }

  
console.log("DATOS REPORTE:", data)

  return data
}


/* =========================
   OBTENER HISTORIAL PAGOS
========================= */
export const getHistorialPagos = async (ventaId) => {
  const res = await fetch(`${API.pagos.historial}${ventaId}/`)

  if (!res.ok) {
    throw new Error("Error obteniendo historial de pagos")
  }

  return res.json()
}
