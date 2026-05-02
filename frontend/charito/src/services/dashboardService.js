// src/config/services/dashboardService.js
import { API } from "@/src/config/api"
import { limpiarCacheRequest, obtenerJsonCacheado } from "@/src/utils/requestCache"

const DASHBOARD_CACHE_TTL = 60_000

const obtenerResumenCacheKey = ({ periodo, fechaInicio, fechaFin }) =>
  `dashboard:resumen:${periodo || "semana_laboral"}:${fechaInicio || ""}:${fechaFin || ""}`

export const dashboardService = {
  async getResumen(params = {}, opciones = {}) {
    const query = new URLSearchParams()

    if (params.periodo) query.append("periodo", params.periodo)
    if (params.fechaInicio) query.append("fecha_inicio", params.fechaInicio)
    if (params.fechaFin) query.append("fecha_fin", params.fechaFin)

    const key = obtenerResumenCacheKey(params)
    if (opciones.force) {
      limpiarCacheRequest(key)
    }

    const url = query.toString()
      ? `${API.dashboard.resumen}?${query.toString()}`
      : API.dashboard.resumen

    return obtenerJsonCacheado({
      key,
      ttlMs: DASHBOARD_CACHE_TTL,
      fetcher: async () => {
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error("Error al cargar resumen del dashboard")
        return res.json()
      },
    })
  },

  async getVentas() {
    return obtenerJsonCacheado({
      key: "dashboard:ventas",
      ttlMs: DASHBOARD_CACHE_TTL,
      fetcher: async () => {
        const res = await fetch(`${API.ventas.lista}?modulo=dashboard`, {
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error("Error al cargar ventas")
        return res.json()
      },
    })
  },

  async getCobradores() {
    return obtenerJsonCacheado({
      key: "dashboard:cobradores",
      ttlMs: DASHBOARD_CACHE_TTL,
      fetcher: async () => {
        const res = await fetch(API.cobradores.lista, {
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error("Error al cargar cobradores")
        return res.json()
      },
    })
  },

  async getPagos() {
    return obtenerJsonCacheado({
      key: "dashboard:pagos",
      ttlMs: DASHBOARD_CACHE_TTL,
      fetcher: async () => {
        const res = await fetch(`${API.pagos.lista}?modulo=dashboard`, {
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error("Error al cargar pagos")
        return res.json()
      },
    })
  },

  async getContratosSalida(params = {}) {
    const query = new URLSearchParams()

    if (params.periodo) query.append("periodo", params.periodo)
    if (params.fechaInicio) query.append("fecha_inicio", params.fechaInicio)
    if (params.fechaFin) query.append("fecha_fin", params.fechaFin)
    if (params.cobrador && params.cobrador !== "todos") {
      query.append("cobrador", params.cobrador)
    }
    if (params.search) query.append("search", params.search)
    if (params.page) query.append("page", String(params.page))
    if (params.pageSize) query.append("page_size", String(params.pageSize))

    const url = query.toString()
      ? `${API.ventas.contratosSalida}?${query.toString()}`
      : API.ventas.contratosSalida

    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error("Error al cargar contratos de salida")
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
