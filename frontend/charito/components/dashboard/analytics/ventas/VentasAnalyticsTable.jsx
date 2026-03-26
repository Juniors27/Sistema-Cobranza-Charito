import { BarChart3 } from "lucide-react"
import { EmptyState } from "@/components/ui"
import {
  formatearFecha,
  formatearMoneda,
} from "@/src/utils/ventasAnalyticsUtils"

export default function VentasAnalyticsTable({
  filtroAplicado,
  ventasFiltradas,
  ventasPorFecha,
  loadingFiltro,
}) {
  if (!filtroAplicado && !loadingFiltro) return null

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)] md:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sky-700">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
            Resultado del reporte
          </h3>
          <p className="text-sm text-slate-500">
            Resumen diario y detalle de contratos del periodo consultado.
          </p>
        </div>
      </div>

      {loadingFiltro ? (
        <div className="py-12 text-center text-slate-500">Actualizando reporte...</div>
      ) : ventasFiltradas.length === 0 ? (
        <EmptyState mensaje="No hay ventas registradas para el filtro seleccionado." />
      ) : (
        <div className="mt-6 space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-230 text-sm text-slate-800">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Ventas</th>
                  <th className="px-4 py-3 text-left font-semibold">Unidades</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto vendido</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorFecha.map((item) => (
                  <tr key={item.fecha} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatearFecha(item.fecha)}
                    </td>
                    <td className="px-4 py-3">{item.cantidadVentas}</td>
                    <td className="px-4 py-3">{item.unidades}</td>
                    <td className="px-4 py-3 text-right font-semibold text-sky-700">
                      {formatearMoneda(item.montoTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-300 text-sm text-slate-800">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Contrato</th>
                  <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Cobrador</th>
                  <th className="px-4 py-3 text-left font-semibold">Productos</th>
                  <th className="px-4 py-3 text-center font-semibold">Cantidad</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {venta.numero_contrato}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{venta.cliente}</div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                        {venta.zona}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatearFecha(venta.fecha_venta)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {venta.cobrador_nombre || "Sin cobrador"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {venta.producto_nombre || "Sin detalle"}
                    </td>
                    <td className="px-4 py-3 text-center">{venta.cantidad}</td>
                    <td className="px-4 py-3 text-right font-semibold text-sky-700">
                      {formatearMoneda(venta.precio_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
