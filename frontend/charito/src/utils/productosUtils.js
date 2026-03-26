/* =========================
   NORMALIZAR PRODUCTOS
========================= */
const normalizarClaveProducto = (nombre = "") =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim()

const PRODUCTOS_EQUIVALENTES = {
  CESTO: "CESTOS",
  "KING - KONG": "KING KONG",
  "COMODA MELAMINE ADULTO": "CÓMODA MELAMINE MEDIANA ADULTO",
  "COMODA MELAMINE NINO": "CÓMODA MELAMINE MEDIANA NIÑO",
  "COMODA MELAMINE ROSADA": "CÓMODA MELAMINE MEDIANA NIÑA",
  "LIBRERO MELAMINE ROSADO": "LIBRERO MELAMINE COLOR NIÑA",
  "LIBRERO MELAMINE NINO": "LIBRERO MELAMINE COLOR NIÑO",
  ESQUINERO: "ESQUINERO MELAMINE",
  "COBERTOR C/S NUEVO": "COBERTOR C/S ESPECIAL NUEVO",
  "COBERTOR C/S GRUESO": "COBERTOR C/SÁBANA TELA GRUESO",
  "COBERTOR C/S NINO": "COBERTOR C/SÁBANA NIÑO",
  "COBERTOR C/S NINA": "COBERTOR C/SÁBANA NIÑA",
  EXTRACTOR: "EXTRACTOR DE JUGOS",
  "LICUADORA OSTER": "LICUADORA OSTER PRO",
  "ARROCERA 4.2 LITROS": "OLLA ARROCERA 4.2 LITROS",
  "OLLAS ACERO X 6": "OLLAS DE ACERO X 6",
  "OLLAS ALUMINIO": "OLLAS DE ALUMINIO",
  "PLANCHA OSTER": "PLANCHA OSTER VAPOR",
  "PLANCHA OSTER - SARTEN ROCA": "PLANCHA OSTER VAPOR",
  PORTAVAGIA: "PORTAVAGIA REY",
  "REPOSTERO MELAMINE": "REPOSTERO MELAMINE GRANDE",
  "ROPERO MELAMINE ADULTO": "ROPERO MELAMINE 2 PUERTAS ADULTO",
  "ROPERO MELAMINE NINA": "ROPERO MELAMINE 2 PUERTAS COLOR NIÑA",
  "ROPERO MELAMINE NINO": "ROPERO MELAMINE 2 PUERTAS COLOR NIÑO",
  "SABANA CUADRADA": "SÁBANA CUADRADA 2 PLZ",
  "SABANA NANCY 1 1/2 PLAZAS": "SÁBANA NANCY 1 1/2 PLZ",
  "SABANA NANCY 2 PLAZAS": "SÁBANA NANCY 2 PLZ",
  "SARTEN ROCA VOLCANICA": "SARTÉN ROCA VOLCÁNICA",
  "TARIMA 1.5 PLAZAS": "TARIMA 1 1/2 PLZ",
  "TARIMA 2 PLAZAS": "TARIMA 2 PLZ",
  TINA: "TINAS",
  "ZAPATERO CON ADORNO": "ZAPATERO C/ADORNO",
}

const obtenerNombreCanonicoProducto = (nombre = "") => {
  const limpio = nombre.replace(/\s+/g, " ").trim()
  const claveNormalizada = normalizarClaveProducto(limpio)

  return {
    clave: PRODUCTOS_EQUIVALENTES[claveNormalizada] || claveNormalizada,
    nombre: PRODUCTOS_EQUIVALENTES[claveNormalizada] || limpio.toUpperCase(),
  }
}

/* =========================
   AGRUPAR PRODUCTOS
========================= */
export const agruparProductos = (ventas) => {
  const map = {}

  ventas.forEach(v => {
    const productos = Array.isArray(v.productos) && v.productos.length > 0
      ? v.productos
      : [{
          nombre: v.producto_nombre,
          cantidad: v.cantidad,
          precio_total: v.precio_total,
        }]

    productos.forEach((producto) => {
      const { clave, nombre } = obtenerNombreCanonicoProducto(producto.nombre)

      if (!map[clave]) {
        map[clave] = {
          nombre,
          cantidad: 0,
          precioTotal: 0,
        }
      }

      map[clave].cantidad += Number(producto.cantidad || 0)
      map[clave].precioTotal += Number(producto.precio_total || 0)
    })
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
