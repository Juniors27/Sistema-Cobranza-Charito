import { Filter } from "lucide-react"

export default function ProductosFilter(props) {
  const {
    filterType,
    setFilterType,
    mesesDisponibles,
    mesSeleccionado,
    setMesSeleccionado,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    aplicarFiltro,
    limpiarFiltro
  } = props

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-2 rounded-xl">
          <Filter className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-indigo-900 tracking-tight">
          Productos Vendidos
        </h2>
      </div>

      {/* Selector tipo filtro */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilterType("mes")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            filterType === "mes"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Mes
        </button>

        <button
          onClick={() => setFilterType("rango")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            filterType === "rango"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Rango
        </button>
      </div>

      {/* Filtro por mes */}
      {filterType === "mes" && (
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 shadow-sm"
        >
          {mesesDisponibles.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      )}

      {/* Filtro por rango */}
      {filterType === "rango" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm text-gray-800"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm text-gray-800"
          />
        </div>
      )}

      {/* Botones acción */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={aplicarFiltro}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all duration-200"
        >
          Aplicar
        </button>

        <button
          onClick={limpiarFiltro}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
