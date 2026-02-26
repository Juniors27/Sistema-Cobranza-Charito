// src/config/utils/dashboardUtils.js

export const calcularMetricasDashboard = (ventas, cobradores) => {
  const estadosInactivos = ["cancelada", "recogido", "bajada"]

  const ventasActivas = ventas.filter(
    (v) =>
      !estadosInactivos.includes(v.estado?.toLowerCase()) &&
      parseFloat(v.saldo_pendiente) > 0
  )

  const clientesPorZona = {
    milagro: ventasActivas.filter((v) => v.zona === "milagro").length,
    huanchaco: ventasActivas.filter((v) => v.zona === "huanchaco").length,
    buenosAires: ventasActivas.filter((v) => v.zona === "buenos aires").length,
  }

  const clientesPorCobrador = cobradores.map((cobrador) => ({
    nombre: cobrador.nombre,
    cantidad: ventasActivas.filter(
      (v) => v.cobrador === cobrador.id
    ).length,
    bajadas: ventas.filter(
      (v) =>
        v.cobrador === cobrador.id &&
        v.estado?.toLowerCase() === "bajada"
    ).length,
    zona: cobrador.zona,
  }))

  const totalSaldoPendiente = ventasActivas.reduce(
    (sum, v) => sum + (parseFloat(v.saldo_pendiente) || 0),
    0
  )

  const totalVentas = ventasActivas.reduce(
    (sum, v) => sum + (parseFloat(v.monto) || 0),
    0
  )

  return {
    ventasActivas,
    clientesPorZona,
    clientesPorCobrador,
    totalSaldoPendiente,
    totalVentas,
  }
}
