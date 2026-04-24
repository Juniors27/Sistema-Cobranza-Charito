import { API } from "@/src/config/api"


/* =========================
   BUSCAR ÚLTIMO PAGO
========================= */
export const buscarUltimoPagoService = async (numeroContrato, lote = "") => {
  const params = new URLSearchParams()

  if (lote) params.append("lote", lote)

  const url = params.toString()
    ? `${API.pagos.ultimoPago}${numeroContrato}/?${params.toString()}`
    : `${API.pagos.ultimoPago}${numeroContrato}/`

  const res = await fetch(url)
  const data = await res.json()
  return { res, data }
}

/* =========================
   REGISTRAR PAGO
========================= */
export const registrarPagoService = async (payload) => {
  const res = await fetch(API.pagos.registrar, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return { res, data }
}

/* =========================
   EDITAR PAGO
========================= */
export const editarPagoService = async (id, payload) => {
  const res = await fetch(`${API.pagos.editarPago}${id}/editar/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return { res, data }
}

/* =========================
   ELIMINAR PAGO
========================= */
export const eliminarPagoService = async (id) => {
  const res = await fetch(`${API.pagos.eliminarPago}${id}/eliminar/`, {
    method: "DELETE",
  })
  const data = await res.json()
  return { res, data }
}
