// src/config/services/dashboardService.js
import { API } from "@/src/config/api"

export const dashboardService = {
  async getVentas() {
    const res = await fetch(`${API.ventas.lista}?modulo=dashboard`, {
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

  async getPagos() {
    const res = await fetch(API.pagos.lista, {
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error("Error al cargar pagos")
    return res.json()
  },

  async actualizarProgramacionPrimerCobro(ventaId, data) {
    const res = await fetch(API.ventas.programacionPrimerCobro(ventaId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) throw new Error("Error al actualizar la programacion del primer cobro")
    return res.json()
  },
}
