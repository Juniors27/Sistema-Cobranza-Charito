const parsearFechaLocal = (fecha) => {
  if (!fecha) return null

  const [year, month, day] = fecha.split("-").map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

export const validarFechaNoFutura = (fecha) => {
  const hoy = new Date()
  const fechaPago = parsearFechaLocal(fecha)

  if (!fechaPago) return false

  hoy.setHours(0, 0, 0, 0)
  fechaPago.setHours(0, 0, 0, 0)

  return fechaPago <= hoy
}
