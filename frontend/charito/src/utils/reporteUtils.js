/* =========================
   CALCULAR TOTAL MONTO
========================= */
//export const calcularTotalMonto = (pagos = []) => {
  //return pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0)
//}

export const calcularTotalMonto = (pagos = []) => {
  return pagos
    .filter(p => !p.es_descuento)
    .reduce((sum, p) => sum + Number(p.monto || 0), 0)
}


/* =========================
   CALCULAR TOTAL PAGADO
========================= */
export const calcularTotalPagado = (historial = []) => {
  return historial.reduce((sum, p) => sum + Number(p.monto || 0), 0)
}
