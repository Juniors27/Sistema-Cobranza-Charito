import { formatearFechaDMY } from "@/src/utils/clientesUtils"
import { formatearCodigoContrato } from "@/src/utils/contratosUtils"

export const periodosContratosSalida = [
  { id: "semana_laboral", label: "Semana Laboral" },
  { id: "historico", label: "Historico" },
  { id: "rango", label: "Rango" },
]

export const formatearFechaContratoSalida = (fecha) =>
  formatearFechaDMY(fecha) || "No definida"

export const obtenerCodigoContratoSalida = (contrato) =>
  contrato?.codigo_contrato ||
  formatearCodigoContrato(contrato?.lote, contrato?.numero_contrato) ||
  contrato?.numero_contrato ||
  ""

export const formatearMontoContratoSalida = (monto) => `S/ ${Number(monto || 0).toFixed(2)}`

export const formatearRangoContratoSalida = (inicio, fin) =>
  `${formatearFechaContratoSalida(inicio)} al ${formatearFechaContratoSalida(fin)}`

export const obtenerEstadoEntregaContratoSalida = (contrato) => {
  if (contrato.entregado_cobrador) return "entregado"
  if (contrato.fecha_entrega_cobrador) return "programado"
  return "pendiente"
}

export const obtenerEstadoPrimerPagoContratoSalida = (contrato) => {
  const estadoContrato = contrato.estado?.toLowerCase()

  if (estadoContrato === "recogido") {
    return {
      etiqueta: "Recogido",
      clases: "bg-orange-100 text-orange-700",
    }
  }

  if (contrato.primer_pago_registrado) {
    return {
      etiqueta: formatearFechaContratoSalida(contrato.fecha_primer_pago),
      clases: "bg-emerald-100 text-emerald-700",
    }
  }

  return {
    etiqueta: "Pendiente",
    clases: "bg-amber-100 text-amber-700",
  }
}
