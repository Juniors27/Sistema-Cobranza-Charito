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
    <div className="max-w-2xl mx-auto bg-white rounded-[28px] shadow-[0_18px_38px_rgba(15,23,42,0.06)] border border-slate-200 p-8 transition-all">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-sky-100 p-2 rounded-xl">
          <Filter className="w-6 h-6 text-sky-700" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Productos Vendidos
        </h2>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilterType("mes")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            filterType === "mes"
              ? "bg-sky-700 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Mes
        </button>

        <button
          onClick={() => setFilterType("rango")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            filterType === "rango"
              ? "bg-sky-700 text-white shadow-md"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Rango
        </button>
      </div>

      {filterType === "mes" && (
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-600 focus:outline-none text-slate-800 shadow-sm"
        >
          {mesesDisponibles.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      )}

      {filterType === "rango" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-600 focus:outline-none shadow-sm text-slate-800"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-600 focus:outline-none shadow-sm text-slate-800"
          />
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          onClick={aplicarFiltro}
          className="px-6 py-3 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-semibold shadow-md transition-all duration-200"
        >
          Aplicar
        </button>

        <button
          onClick={limpiarFiltro}
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
