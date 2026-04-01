import { ArrowRight, CalendarRange, Sparkles } from "lucide-react"
import {
  formatearRangoContratoSalida,
  periodosContratosSalida,
} from "./contratosSalidaUtils"

export default function ContratosSalidaFiltros({
  periodo,
  setPeriodo,
  cobradorFiltro,
  setCobradorFiltro,
  cobradores,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  rangoSemanaLaboral,
  etiquetaPeriodo,
}) {
  return (
    <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_32%),linear-gradient(135deg,#f8fafc_0%,#ffffff_40%,#ecfeff_100%)] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              <Sparkles className="h-4 w-4" />
              Flujo de salida
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Semana operativa de contratos
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-600">
              El filtro de semana laboral toma como referencia la fecha prometida del primer pago.
              De domingo a viernes mantiene visible la semana operativa actual y el sabado te prepara
              la siguiente salida de domingo a miercoles.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <CalendarRange className="h-4 w-4 text-sky-700" />
                {periodo === "historico"
                  ? "Promesas registradas"
                  : periodo === "rango"
                    ? "Rango seleccionado"
                    : "Semana laboral"}
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {periodo === "historico"
                  ? "Todas las fechas de promesa de pago"
                  : periodo === "rango" && fechaInicio && fechaFin
                    ? formatearRangoContratoSalida(fechaInicio, fechaFin)
                    : formatearRangoContratoSalida(rangoSemanaLaboral.inicio, rangoSemanaLaboral.fin)}
              </div>
            </div>

            <div className="rounded-2xl border border-white/80 bg-slate-950 px-4 py-3 text-white shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Logica activa
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-100">
                {periodo === "historico"
                  ? "Vista completa de promesas"
                  : periodo === "rango"
                    ? "Consulta personalizada"
                    : "Domingo-Miercoles"}
                {periodo === "semana_laboral" && (
                  <>
                    <ArrowRight className="h-4 w-4 text-sky-300" />
                    seguimiento operativo
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Filtros de seguimiento
            </div>
            <p className="mt-2 text-sm text-slate-600">{etiquetaPeriodo}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Periodo</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              >
                {periodosContratosSalida.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Cobrador</label>
              <select
                value={cobradorFiltro}
                onChange={(e) => setCobradorFiltro(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              >
                <option value="todos">Todos los cobradores</option>
                {cobradores.map((cobrador) => (
                  <option key={cobrador.id} value={String(cobrador.id)}>
                    {cobrador.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={periodo !== "rango"}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={periodo !== "rango"}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
