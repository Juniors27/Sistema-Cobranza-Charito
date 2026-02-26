// src/config/services/dashboardService.js
import { API } from "@/src/config/api"

export const dashboardService = {
  async getVentas() {
    const res = await fetch(API.ventas.lista, {
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error("Error al cargar ventas")
    return res.json()
  },

  async getCobradores() {
    const res = await fetch(API.cobradores.lista, {
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error("Error al cargar cobradores")
    return res.json()
  },
}
