import { API } from "@/src/config/api"


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