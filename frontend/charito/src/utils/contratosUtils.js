export const obtenerLoteDesdeFechaVenta = (fechaVenta = "") => {
  const anio = String(fechaVenta).slice(0, 4)

  if (!/^\d{4}$/.test(anio)) return ""

  return anio.slice(-2)
}

export const formatearCodigoContrato = (lote = "", numeroContrato = "") => {
  const numero = String(numeroContrato || "").replace(/\D/g, "")

  if (lote && numero) return `${lote}-${numero}`
  if (numero) return numero
  return lote
}
