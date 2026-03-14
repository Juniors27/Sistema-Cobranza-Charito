import { RefreshCw } from "lucide-react"

export function SectionHeader({
  titulo,
  subtitulo,
  onRefresh,
  textoBoton = "Actualizar",
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/95 px-6 py-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)] backdrop-blur mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Modulo Administrativo
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            {titulo}
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-500">
            {subtitulo}
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
            {textoBoton}
          </button>
        )}
      </div>
    </div>
  )
}
