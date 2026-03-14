import { BarChart3 } from "lucide-react"

export default function ProductosTable({
  productosFiltrados,
  filtroAplicado,
  totalMonto,
  totalCantidad
}) {
  if (!filtroAplicado) return null

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-[28px] shadow-[0_18px_38px_rgba(15,23,42,0.06)] border border-slate-200 p-8 transition-all">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-sky-100 p-2 rounded-xl">
          <BarChart3 className="w-6 h-6 text-sky-700" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
          Ventas por Producto
        </h3>
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="text-slate-500 text-lg">No hay datos para el filtro seleccionado.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-slate-800">
              <thead>
                <tr className="bg-slate-50 text-slate-900">
                  <th className="text-left py-4 px-6 font-semibold">Producto</th>
                  <th className="text-center py-4 px-6 font-semibold">Cantidad</th>
                  <th className="text-right py-4 px-6 font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6 font-medium">{p.nombre}</td>
                    <td className="py-4 px-6 text-center">{p.cantidad}</td>
                    <td className="py-4 px-6 text-right font-semibold text-sky-700">
                      S/ {p.precioTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-5 bg-sky-50 rounded-xl shadow-sm border border-sky-100">
              <p className="text-sm text-sky-700">Total Ventas</p>
              <p className="text-2xl font-bold text-sky-900">
                S/ {totalMonto.toFixed(2)}
              </p>
            </div>

            <div className="p-5 bg-emerald-50 rounded-xl shadow-sm border border-emerald-100">
              <p className="text-sm text-emerald-700">Cantidad Vendida</p>
              <p className="text-2xl font-bold text-emerald-900">
                {totalCantidad}
              </p>
            </div>

            <div className="p-5 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-700">Comision 8%</p>
              <p className="text-2xl font-bold text-slate-900">
                S/ {(totalMonto * 0.08).toFixed(2)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
