export default function ContratosSalidaGrupos({
  gruposPorCobrador,
  cobradorFiltro,
  setCobradorFiltro,
}) {
  return (
    <section className="mt-4 rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,250,252,1)_100%)] p-5 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Resumen por cobrador
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Salidas agrupadas</h2>
        </div>
        <div className="text-sm text-slate-500">
          {gruposPorCobrador.length} cobradores con contratos en el filtro actual
        </div>
      </div>

      {gruposPorCobrador.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-500">
          No hay contratos de salida para los filtros seleccionados.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {gruposPorCobrador.map((grupo) => (
            <button
              key={grupo.id}
              type="button"
              onClick={() => setCobradorFiltro(String(grupo.id))}
              className={`rounded-3xl border bg-linear-to-br p-4 text-left shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(15,23,42,0.1)] ${
                cobradorFiltro === String(grupo.id)
                  ? "border-sky-400 from-sky-100 via-cyan-50 to-white ring-2 ring-sky-200"
                  : "border-slate-200 from-white via-slate-50 to-sky-50"
              }`}
              aria-pressed={cobradorFiltro === String(grupo.id)}
              title={`Filtrar tabla por ${grupo.nombre}`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cobrador
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{grupo.nombre}</h3>
                  <p className="mt-1 capitalize text-sm text-slate-500">{grupo.zona}</p>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                  {cobradorFiltro === String(grupo.id) ? "Activo" : "Filtrar"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-sky-50 px-3 py-3 text-sky-800">
                  <div className="text-lg font-semibold">{grupo.total}</div>
                  <div>Total</div>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-3 text-slate-800">
                  <div className="text-lg font-semibold">{grupo.inactivos}</div>
                  <div>Inactivos</div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    {grupo.recogidos} rec. · {grupo.cancelados} canc.
                    {grupo.bajados ? ` · ${grupo.bajados} baj.` : ""}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-3 text-emerald-800">
                  <div className="text-lg font-semibold">{grupo.yaPagaron}</div>
                  <div>Activos pagaron</div>
                </div>
                <div className="rounded-2xl bg-amber-50 px-3 py-3 text-amber-800">
                  <div className="text-lg font-semibold">{grupo.pendientes}</div>
                  <div>Activos pendientes</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
