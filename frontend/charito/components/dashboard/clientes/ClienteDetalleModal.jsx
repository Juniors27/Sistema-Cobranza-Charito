"use client"

import { X } from "lucide-react"
import { calcularTotalPagado } from "@/src/utils/reporteUtils"
import { formatearFechaDMY } from "@/src/utils/clientesUtils"

export default function ClienteDetalleModal({
  ventaDetalle,
  historialPagos,
  cargandoHistorial,
  cerrarModalDetalle,
}) {
  if (!ventaDetalle) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-sky-900 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                Comercial CHARITO
              </p>
              <h2 className="mt-2 text-lg font-medium text-slate-200">Detalle del cliente</h2>
              <p className="mt-3 text-3xl font-semibold tracking-[0.08em] text-white md:text-4xl">
                {ventaDetalle.numero_contrato}
              </p>
            </div>

            <button
              onClick={cerrarModalDetalle}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-7 space-y-5 text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cliente</p>
              <p className="mt-2 text-lg font-semibold">
                {ventaDetalle.nombre} {ventaDetalle.apellido}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Producto</p>
              <p className="mt-2 text-lg font-semibold">
                {ventaDetalle.producto_nombre?.toUpperCase() || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dirección</p>
              <p className="mt-2 text-base font-medium">{ventaDetalle.direccion || "N/A"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lugar / Zona</p>
              <p className="mt-2 text-base font-medium">
                {ventaDetalle.lugar || "N/A"} / {ventaDetalle.zona?.toUpperCase() || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fecha de Venta</p>
              <p className="mt-2 text-base font-medium">
                {ventaDetalle.fecha_venta
                  ? formatearFechaDMY(ventaDetalle.fecha_venta)
                  : "N/A"}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Fecha Prometida Del Primer Pago
              </p>
              <p className="mt-2 text-base font-semibold text-amber-900">
                {ventaDetalle.fecha_primer_cobro
                  ? formatearFechaDMY(ventaDetalle.fecha_primer_cobro)
                  : "No programada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cobrador / Dia</p>
              <p className="mt-2 text-base font-medium">
                {ventaDetalle.cobrador_nombre?.toUpperCase() || "N/A"} / {ventaDetalle.dia_cobro || "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h4 className="text-lg font-semibold text-slate-900">Historial de Pagos</h4>
            </div>

            {cargandoHistorial ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-700 border-t-transparent"></div>
                <p className="mt-3 text-slate-500">Cargando historial...</p>
              </div>
            ) : historialPagos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                      <th className="text-right py-3 px-4 font-semibold">Monto</th>
                      <th className="text-right py-3 px-4 font-semibold">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPagos.map((pago, index) => (
                      <tr key={pago.id || index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600">{pago.fecha_pago}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                          S/ {Number(pago.monto).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                          S/ {Number(pago.saldo_despues_pago).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <p>No se encontró historial de pagos</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Precio Venta</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                S/ {Number(ventaDetalle.precio_total || 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Saldo Pendiente</p>
              <p className="mt-2 text-2xl font-semibold text-rose-700">
                S/ {Number(ventaDetalle.saldo_pendiente || 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Total Pagado</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">
                S/ {calcularTotalPagado(historialPagos)}
              </p>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Frecuencia</p>
              <p className="mt-2 text-2xl font-semibold text-sky-800 capitalize">
                {ventaDetalle.frecuencia_pago || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Monto Frecuencia
              </p>
              <p className="mt-2 text-2xl font-semibold text-amber-800">
                {ventaDetalle.monto_frecuencia
                  ? `S/ ${Number(ventaDetalle.monto_frecuencia).toFixed(2)}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
