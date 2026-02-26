import { BarChart3 } from "lucide-react"

export default function ProductosTable({
  productosFiltrados,
  filtroAplicado,
  totalMonto,
  totalCantidad
}) {
  if (!filtroAplicado) return null

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-2 rounded-xl">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-indigo-900 tracking-tight">
          Ventas por Producto
        </h3>
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-lg">No hay datos para el filtro seleccionado.</p>
      ) : (
        <>
          {/* Tabla */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-gray-800">
              <thead>
                <tr className="bg-indigo-50 text-indigo-900">
                  <th className="text-left py-4 px-6 font-semibold">Producto</th>
                  <th className="text-center py-4 px-6 font-semibold">Cantidad</th>
                  <th className="text-right py-4 px-6 font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6 font-medium">{p.nombre}</td>
                    <td className="py-4 px-6 text-center">{p.cantidad}</td>
                    <td className="py-4 px-6 text-right font-semibold text-indigo-700">
                      S/ {p.precioTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-5 bg-blue-50 rounded-xl shadow-sm border border-blue-100">
              <p className="text-sm text-blue-700">Total Ventas</p>
              <p className="text-2xl font-bold text-blue-900">
                S/ {totalMonto.toFixed(2)}
              </p>
            </div>

            <div className="p-5 bg-green-50 rounded-xl shadow-sm border border-green-100">
              <p className="text-sm text-green-700">Cantidad Vendida</p>
              <p className="text-2xl font-bold text-green-900">
                {totalCantidad}
              </p>
            </div>

            <div className="p-5 bg-purple-50 rounded-xl shadow-sm border border-purple-100">
              <p className="text-sm text-purple-700">Comisión 8%</p>
              <p className="text-2xl font-bold text-purple-900">
                S/ {(totalMonto * 0.08).toFixed(2)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
