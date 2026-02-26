export const obtenerCantidadClientes = (ventas, cobradorId) => {
  const estadosInactivos = ["cancelada", "recogido", "bajada"]

  return ventas.filter((v) =>
    v.cobrador === cobradorId &&
    !estadosInactivos.includes(v.estado?.toLowerCase()) &&
    parseFloat(v.saldo_pendiente) > 0
  ).length
}
