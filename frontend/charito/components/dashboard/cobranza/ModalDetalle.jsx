"use client"

import { Printer, X } from "lucide-react"
import { calcularTotalPagado } from "@/src/utils/reporteUtils"
import { formatearFechaDMY } from "@/src/utils/clientesUtils"

export default function ModalDetalle({
  pagoSeleccionado,
  historialPagos,
  cargandoHistorial,
  cerrarModal,
  printRef,
}) {
  const imprimirTarjeta = () => {
    window.print()
  }

  return (
    <div className="print-shell fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={printRef}
        className="tarjeta-print w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
      >
        <div className="print-header border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-sky-900 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">
                Comercial CHARITO
              </p>
              <h2 className="mt-2 text-lg font-medium text-slate-200">Detalle del contrato</h2>
              <p className="mt-3 text-3xl font-semibold tracking-[0.08em] text-white md:text-4xl">
                {pagoSeleccionado.numeroContrato}
              </p>
            </div>

            <div className="print-actions flex items-center gap-2">
              <button
                onClick={imprimirTarjeta}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
                title="Imprimir tarjeta"
              >
                <Printer className="w-5 h-5" />
              </button>

              <button
                onClick={cerrarModal}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="print-content p-6 md:p-7 space-y-5 text-slate-800">
          <div className="print-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="print-block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cliente</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{pagoSeleccionado.cliente}</p>
            </div>

            <div className="print-block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Producto</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {pagoSeleccionado.producto?.toUpperCase() || "N/A"}
              </p>
            </div>

            <div className="print-block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Direccion</p>
              <p className="mt-2 text-base font-medium text-slate-800">
                {pagoSeleccionado.direccion || "N/A"}
              </p>
            </div>

            <div className="print-block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zona</p>
              <p className="mt-2 text-base font-medium text-slate-800">
                {pagoSeleccionado.zona?.toUpperCase() || "N/A"}
              </p>
            </div>

            <div className="print-block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fecha de Venta</p>
              <p className="mt-2 text-base font-medium text-slate-800">
                {pagoSeleccionado.fecha_venta
                  ? formatearFechaDMY(pagoSeleccionado.fecha_venta)
                  : "N/A"}
              </p>
            </div>

            <div className="print-block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cobrador</p>
              <p className="mt-2 text-base font-medium text-slate-800">
                {pagoSeleccionado.cobradorNombre?.toUpperCase() || "N/A"}
              </p>
            </div>
          </div>

          <div className="print-history rounded-[24px] border border-slate-200 bg-white">
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
                <p>No se encontro historial de pagos</p>
              </div>
            )}
          </div>

          <div className="print-summary grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="print-block rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Saldo Pendiente</p>
              <p className="mt-2 text-2xl font-semibold text-rose-700">
                S/ {Number(pagoSeleccionado.saldo_pendiente || 0).toFixed(2)}
              </p>
            </div>

            <div className="print-block rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Total Pagado</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">
                S/ {calcularTotalPagado(historialPagos)}
              </p>
            </div>

            <div className="print-block rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Estado de Cobro</p>
              <p className="mt-2 text-2xl font-semibold text-sky-800">
                {Number(pagoSeleccionado.saldo_pendiente) === 0 ? "Cancelado" : "Activo"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
