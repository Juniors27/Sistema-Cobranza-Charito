export const validarFechaNoFutura = (fecha) => {
  const hoy = new Date()
  const fechaPago = new Date(fecha)

  hoy.setHours(0, 0, 0, 0)
  fechaPago.setHours(0, 0, 0, 0)

  return fechaPago <= hoy
}
