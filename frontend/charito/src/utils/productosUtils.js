/* =========================
   AGRUPAR PRODUCTOS
========================= */
export const agruparProductos = (ventas) => {
  const map = {}

  ventas.forEach(v => {
    const nombre = v.producto_nombre

    if (!map[nombre]) {
      map[nombre] = {
        nombre,
        cantidad: 0,
        precioTotal: 0,
      }
    }

    map[nombre].cantidad += v.cantidad
    map[nombre].precioTotal += Number(v.precio_total)
  })

  return Object.values(map)
}

/* =========================
   OBTENER MESES DISPONIBLES
========================= */
export const obtenerMesesDisponibles = (ventas) => {
  const setMeses = new Set()

  ventas.forEach(v => {
    const fecha = new Date(v.fecha_venta)
    const y = fecha.getFullYear()
    const m = String(fecha.getMonth() + 1).padStart(2, "0")
    setMeses.add(`${y}-${m}`)
  })

  return Array.from(setMeses)
    .sort((a, b) => (a < b ? 1 : -1))
    .map(m => {
      const [y, mo] = m.split("-")
      const label = new Date(y, mo - 1).toLocaleString("es-PE", {
        month: "long"
      })

      return {
        value: m,
        label: `${label.charAt(0).toUpperCase() + label.slice(1)} ${y}`
      }
    })
}
