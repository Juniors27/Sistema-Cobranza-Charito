"use client"

import { CalendarRange } from "lucide-react"

const FILTER_OPTIONS = [
  { id: "simple", label: "Fecha simple" },
  { id: "rango", label: "Rango" },
]

export default function PanelFiltros({
  tipoFecha,
  setTipoFecha,
  cobradores,
  filtros,
  handleFiltroChange,
  aplicarFiltros,
  limpiarFiltros,
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
              onClick={() => setTipoFecha(option.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tipoFecha === option.id
                  ? "bg-sky-700 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-3">
          <div className="w-full md:w-auto">
            <select
              name="cobrador"
              value={filtros.cobrador}
              onChange={handleFiltroChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none md:min-w-80"
            >
              <option value="">Todos los cobradores</option>
              {cobradores?.map((cobrador) => (
                <option key={cobrador.id} value={cobrador.id}>
                  {cobrador.nombre} - {cobrador.zona}
                </option>
              ))}
            </select>
          </div>

          {tipoFecha === "simple" && (
            <div className="w-full md:w-auto">
              <input
                type="date"
                name="fecha"
                value={filtros.fecha}
                onChange={handleFiltroChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none md:min-w-56"
              />
            </div>
          )}

          {tipoFecha === "rango" && (
            <div className="flex w-full flex-wrap gap-3 md:w-auto">
              <input
                type="date"
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none md:min-w-56"
              />
              <input
                type="date"
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleFiltroChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none md:min-w-56"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={aplicarFiltros}
            className="rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
          >
            Aplicar filtro
          </button>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </section>
  )
}
