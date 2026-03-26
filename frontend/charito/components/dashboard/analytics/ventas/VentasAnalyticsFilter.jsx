import { CalendarRange, Download, FileText } from "lucide-react"

const FILTER_OPTIONS = [
  { id: "mes", label: "Mes" },
  { id: "fecha", label: "Fecha" },
  { id: "rango", label: "Rango" },
]

export default function VentasAnalyticsFilter({
  filterType,
  setFilterType,
  mesesDisponibles,
  cobradoresDisponibles,
  cobradorSeleccionado,
  setCobradorSeleccionado,
  mesSeleccionado,
  setMesSeleccionado,
  fechaSeleccionada,
  setFechaSeleccionada,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  aplicarFiltro,
  limpiarFiltro,
  loadingFiltro,
  filtroAplicado,
  ventasFiltradas,
  exportarExcel,
  exportarPdf,
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)] md:p-8">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
          <CalendarRange className="h-4 w-4 text-sky-700" />
          Tipo de consulta
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilterType(option.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filterType === option.id
                  ? "bg-sky-700 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-3">
            <select
              value={cobradorSeleccionado}
              onChange={(event) => setCobradorSeleccionado(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="">Todos los cobradores</option>
              {cobradoresDisponibles.map((cobrador) => (
                <option key={cobrador.value} value={cobrador.value}>
                  {cobrador.label}
                </option>
              ))}
            </select>
          </div>

          {filterType === "mes" && (
            <select
              value={mesSeleccionado}
              onChange={(event) => setMesSeleccionado(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="">Selecciona un mes</option>
              {mesesDisponibles.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
          )}

          {filterType === "fecha" && (
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(event) => setFechaSeleccionada(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
            />
          )}

          {filterType === "rango" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="date"
                value={fechaInicio}
                onChange={(event) => setFechaInicio(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(event) => setFechaFin(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => aplicarFiltro()}
            disabled={loadingFiltro}
            className="rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingFiltro ? "Consultando..." : "Aplicar filtro"}
          </button>
          <button
            type="button"
            onClick={limpiarFiltro}
            disabled={loadingFiltro}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Reiniciar
          </button>
          <button
            type="button"
            onClick={exportarExcel}
            disabled={loadingFiltro || !filtroAplicado || ventasFiltradas.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
          <button
            type="button"
            onClick={exportarPdf}
            disabled={loadingFiltro || !filtroAplicado || ventasFiltradas.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>
    </section>
  )
}
