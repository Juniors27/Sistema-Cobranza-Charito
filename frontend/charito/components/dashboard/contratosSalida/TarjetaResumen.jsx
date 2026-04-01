export default function TarjetaResumen({ titulo, valor, detalle, icono: Icono, tono = "sky" }) {
  const estilos = {
    sky: "border-sky-200 bg-linear-to-br from-sky-50 via-white to-cyan-50 text-sky-900",
    emerald:
      "border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-lime-50 text-emerald-900",
    amber:
      "border-amber-200 bg-linear-to-br from-amber-50 via-white to-orange-50 text-amber-900",
    slate: "border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900",
  }

  return (
    <article
      className={`rounded-3xl border p-4 shadow-[0_12px_26px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.1)] ${estilos[tono]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
            {titulo}
          </div>
          <div className="mt-2 text-3xl font-semibold">{valor}</div>
          <div className="mt-1 text-xs opacity-80">{detalle}</div>
        </div>
        <div className="rounded-2xl bg-white/70 p-2.5">
          <Icono className="h-5 w-5" />
        </div>
      </div>
    </article>
  )
}
