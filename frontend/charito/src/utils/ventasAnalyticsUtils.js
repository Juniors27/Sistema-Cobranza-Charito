import * as XLSX from "xlsx"

const DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  month: "long",
  year: "numeric",
})

export const formatearMoneda = (valor = 0) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(Number(valor || 0))

export const normalizarFecha = (fecha) => {
  if (!fecha) return ""

  const [year, month, day] = String(fecha).split("-")
  if (!year || !month || !day) return ""

  return `${year}-${month}-${day}`
}

export const formatearFecha = (fecha) => {
  const fechaNormalizada = normalizarFecha(fecha)
  if (!fechaNormalizada) return "Sin fecha"

  const [year, month, day] = fechaNormalizada.split("-").map(Number)
  return DATE_FORMATTER.format(new Date(year, month - 1, day))
}

export const obtenerMesesDisponibles = (ventas = []) => {
  const meses = new Set()

  ventas.forEach((venta) => {
    const fecha = normalizarFecha(venta.fecha_venta)
    if (!fecha) return

    meses.add(fecha.slice(0, 7))
  })

  return Array.from(meses)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((mes) => {
      const [year, month] = mes.split("-").map(Number)
      const fecha = new Date(year, month - 1, 1)
      const label = MONTH_FORMATTER.format(fecha)

      return {
        value: mes,
        label: `${label.charAt(0).toUpperCase()}${label.slice(1)}`,
      }
    })
}

export const obtenerMesActual = () => {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, "0")

  return `${year}-${month}`
}

export const obtenerFechaActual = () => {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, "0")
  const day = String(hoy.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export const construirDescripcionPeriodo = ({
  filterType,
  mesSeleccionado,
  fechaSeleccionada,
  fechaInicio,
  fechaFin,
  cobradorSeleccionado,
  filtroAplicado = false,
}) => {
  if (!filtroAplicado) {
    return "Selecciona un filtro para consultar ventas y cargar el reporte."
  }

  const sufijoCobrador = cobradorSeleccionado
    ? ` Filtrado por cobrador: ${cobradorSeleccionado}.`
    : ""

  if (filterType === "fecha") {
    return fechaSeleccionada
      ? `Mostrando ventas del ${formatearFecha(fechaSeleccionada)}.${sufijoCobrador}`
      : "Selecciona una fecha para consultar ventas."
  }

  if (filterType === "rango") {
    if (!fechaInicio || !fechaFin) {
      return "Selecciona ambas fechas para analizar el rango."
    }

    return `Mostrando ventas desde ${formatearFecha(fechaInicio)} hasta ${formatearFecha(fechaFin)}.${sufijoCobrador}`
  }

  if (!mesSeleccionado) {
    return "Selecciona un mes para revisar la actividad comercial."
  }

  const mes = obtenerMesesDisponibles([{ fecha_venta: `${mesSeleccionado}-01` }])[0]
  return `Mostrando ventas registradas en ${mes?.label || mesSeleccionado}.${sufijoCobrador}`
}

export const resumirVentas = (ventas = []) => {
  const totalVentas = ventas.length

  const totalMonto = ventas.reduce(
    (acumulado, venta) => acumulado + Number(venta.precio_total || 0),
    0
  )

  const totalUnidades = ventas.reduce(
    (acumulado, venta) => acumulado + Number(venta.cantidad || 0),
    0
  )

  const totalInicial = ventas.reduce(
    (acumulado, venta) => acumulado + Number(venta.inicial || 0),
    0
  )

  return {
    totalVentas,
    totalMonto,
    totalUnidades,
    totalInicial,
    ticketPromedio: totalVentas > 0 ? totalMonto / totalVentas : 0,
    promedioUnidades: totalVentas > 0 ? totalUnidades / totalVentas : 0,
  }
}

export const agruparVentasPorFecha = (ventas = []) => {
  const mapa = new Map()

  ventas.forEach((venta) => {
    const fecha = normalizarFecha(venta.fecha_venta)
    if (!fecha) return

    if (!mapa.has(fecha)) {
      mapa.set(fecha, {
        fecha,
        cantidadVentas: 0,
        montoTotal: 0,
        unidades: 0,
      })
    }

    const actual = mapa.get(fecha)
    actual.cantidadVentas += 1
    actual.montoTotal += Number(venta.precio_total || 0)
    actual.unidades += Number(venta.cantidad || 0)
  })

  return Array.from(mapa.values()).sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

export const obtenerIndicadoresGlobales = (ventas = []) => {
  const fechaHoy = obtenerFechaActual()
  const mesActual = obtenerMesActual()

  const ventasHoy = ventas.filter((venta) => normalizarFecha(venta.fecha_venta) === fechaHoy)
  const ventasMesActual = ventas.filter(
    (venta) => normalizarFecha(venta.fecha_venta).slice(0, 7) === mesActual
  )

  const resumenHoy = resumirVentas(ventasHoy)
  const resumenMesActual = resumirVentas(ventasMesActual)

  return {
    ventasHoy: resumenHoy.totalVentas,
    montoHoy: resumenHoy.totalMonto,
    ventasMesActual: resumenMesActual.totalVentas,
    montoMesActual: resumenMesActual.totalMonto,
  }
}

const escaparHtml = (valor = "") =>
  String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

const construirEtiquetaPeriodo = ({
  filterType,
  mesSeleccionado,
  fechaSeleccionada,
  fechaInicio,
  fechaFin,
  cobradorSeleccionado,
}) => {
  const sufijoCobrador = cobradorSeleccionado
    ? `_cobrador_${String(cobradorSeleccionado).replace(/\s+/g, "_").toLowerCase()}`
    : ""

  if (filterType === "fecha") return fechaSeleccionada || "fecha"
  if (filterType === "rango") {
    return `${fechaInicio || "inicio"}_${fechaFin || "fin"}${sufijoCobrador}`
  }
  return `${mesSeleccionado || "mes"}${sufijoCobrador}`
}

export const exportarVentasReporteExcel = ({
  ventas = [],
  ventasPorFecha = [],
  resumen = {},
  filterType,
  mesSeleccionado,
  fechaSeleccionada,
  fechaInicio,
  fechaFin,
  cobradorSeleccionado,
}) => {
  if (!Array.isArray(ventas) || ventas.length === 0) {
    return false
  }

  const libro = XLSX.utils.book_new()

  const hojaResumen = XLSX.utils.json_to_sheet([
    {
      "Ventas del periodo": resumen.totalVentas || 0,
      "Monto vendido": Number(resumen.totalMonto || 0).toFixed(2),
      "Unidades vendidas": resumen.totalUnidades || 0,
      "Iniciales registradas": Number(resumen.totalInicial || 0).toFixed(2),
    },
  ])

  const hojaDiaria = XLSX.utils.json_to_sheet(
    ventasPorFecha.map((item) => ({
      Fecha: formatearFecha(item.fecha),
      Ventas: item.cantidadVentas,
      Unidades: item.unidades,
      "Monto vendido": Number(item.montoTotal || 0).toFixed(2),
    }))
  )

  const hojaDetalle = XLSX.utils.json_to_sheet(
    ventas.map((venta) => ({
      Contrato: venta.numero_contrato,
      Cliente: venta.cliente,
      Fecha: formatearFecha(venta.fecha_venta),
      Zona: venta.zona,
      Cobrador: venta.cobrador_nombre || "Sin cobrador",
      Productos: venta.producto_nombre || "Sin detalle",
      Cantidad: venta.cantidad,
      "Monto vendido": Number(venta.precio_total || 0).toFixed(2),
      Inicial: Number(venta.inicial || 0).toFixed(2),
    }))
  )

  XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen")
  XLSX.utils.book_append_sheet(libro, hojaDiaria, "Ventas por fecha")
  XLSX.utils.book_append_sheet(libro, hojaDetalle, "Detalle")

  const sufijo = construirEtiquetaPeriodo({
    filterType,
    mesSeleccionado,
    fechaSeleccionada,
    fechaInicio,
    fechaFin,
    cobradorSeleccionado,
  })

  XLSX.writeFile(libro, `reporte_ventas_${sufijo}.xlsx`)
  return true
}

export const imprimirVentasReporte = ({
  ventas = [],
  ventasPorFecha = [],
  resumen = {},
  descripcionPeriodo = "",
}) => {
  if (!Array.isArray(ventas) || ventas.length === 0) {
    return false
  }

  const ventana = window.open("", "_blank", "width=1200,height=900")
  if (!ventana) {
    return false
  }

  const filasResumen = [
    ["Ventas del periodo", resumen.totalVentas || 0],
    ["Monto vendido", formatearMoneda(resumen.totalMonto || 0)],
    ["Unidades vendidas", resumen.totalUnidades || 0],
    ["Iniciales registradas", formatearMoneda(resumen.totalInicial || 0)],
  ]

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Reporte de ventas</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #0f172a; }
      h1, h2 { margin: 0; }
      p { color: #475569; }
      .header { margin-bottom: 24px; }
      .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 20px 0 28px; }
      .card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 14px; background: #f8fafc; }
      .label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
      .value { font-size: 24px; font-weight: 700; margin-top: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; vertical-align: top; }
      th { background: #f8fafc; }
      .section { margin-top: 28px; }
      @media print {
        body { margin: 12mm; }
        .summary { break-inside: avoid; }
        table { break-inside: auto; }
        tr { break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Reporte de ventas</h1>
      <p>${escaparHtml(descripcionPeriodo)}</p>
    </div>

    <div class="summary">
      ${filasResumen
        .map(
          ([label, value]) => `
            <div class="card">
              <div class="label">${escaparHtml(label)}</div>
              <div class="value">${escaparHtml(value)}</div>
            </div>
          `
        )
        .join("")}
    </div>

    <div class="section">
      <h2>Ventas por fecha</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Ventas</th>
            <th>Unidades</th>
            <th>Monto vendido</th>
          </tr>
        </thead>
        <tbody>
          ${ventasPorFecha
            .map(
              (item) => `
                <tr>
                  <td>${escaparHtml(formatearFecha(item.fecha))}</td>
                  <td>${escaparHtml(item.cantidadVentas)}</td>
                  <td>${escaparHtml(item.unidades)}</td>
                  <td>${escaparHtml(formatearMoneda(item.montoTotal))}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Detalle de contratos</h2>
      <table>
        <thead>
          <tr>
            <th>Contrato</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Cobrador</th>
            <th>Productos</th>
            <th>Cantidad</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          ${ventas
            .map(
              (venta) => `
                <tr>
                  <td>${escaparHtml(venta.numero_contrato)}</td>
                  <td>${escaparHtml(venta.cliente)}</td>
                  <td>${escaparHtml(formatearFecha(venta.fecha_venta))}</td>
                  <td>${escaparHtml(venta.cobrador_nombre || "Sin cobrador")}</td>
                  <td>${escaparHtml(venta.producto_nombre || "Sin detalle")}</td>
                  <td>${escaparHtml(venta.cantidad)}</td>
                  <td>${escaparHtml(formatearMoneda(venta.precio_total))}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </body>
</html>`

  ventana.document.open()
  ventana.document.write(html)
  ventana.document.close()
  ventana.focus()
  ventana.print()
  return true
}
