

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const API = {
  base: API_BASE_URL,

  cobradores: {
    root: `${API_BASE_URL}/cobradores/`,
    lista: `${API_BASE_URL}/lista/cobradores/`,
  },

  ventas: {
    root: `${API_BASE_URL}/ventas/`,
    lista: `${API_BASE_URL}/lista/ventas/`,
  },

  reporte: {
    cobranza: `${API_BASE_URL}/reporte/cobranza/`,
  },

  pagos: {
    historial: `${API_BASE_URL}/historial-pagos/`,
    registrar: `${API_BASE_URL}/pagos/registrar/`,
    ultimoPago: `${API_BASE_URL}/pagos/ultimo/`,
    editarPago: `${API_BASE_URL}/pagos/`,
    eliminarPago: `${API_BASE_URL}/pagos/`,
    lista:`${API_BASE_URL}/pagos/`,
  },
}
