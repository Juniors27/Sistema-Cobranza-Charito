import { X } from "lucide-react"
import { formatearFechaContratoSalida } from "./contratosSalidaUtils"

export default function ContratoSalidaEntregaModal({
  contrato,
  valorEntrega,
  actualizarEntregaLocal,
  cerrarEdicionEntrega,
  guardarEntrega,
  guardandoEntregaId,
}) {
  if (!contrato) return null

  const entregaActual = valorEntrega(contrato)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              Gestion de entrega
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {contrato.numero_contrato}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{contrato.cliente}</p>
          </div>

          <button
            onClick={cerrarEdicionEntrega}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
            aria-label="Cerrar edicion de entrega"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <div>
              Promesa de pago:{" "}
              <span className="font-semibold text-slate-900">
                {formatearFechaContratoSalida(contrato.fecha_primer_cobro)}
              </span>
            </div>
            <div className="mt-1">
              Entrega actual:{" "}
              <span className="font-semibold text-slate-900">
                {contrato.entregado_cobrador
                  ? `Entregado${
                      contrato.fecha_entrega_cobrador
                        ? ` (${formatearFechaContratoSalida(contrato.fecha_entrega_cobrador)})`
                        : ""
                    }`
                  : contrato.fecha_entrega_cobrador
                    ? `Programado (${formatearFechaContratoSalida(contrato.fecha_entrega_cobrador)})`
                    : "Pendiente de entrega"}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Estado</label>
            <select
              value={entregaActual.estado}
              onChange={(e) => actualizarEntregaLocal(contrato, { estado: e.target.value })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="pendiente">Pendiente</option>
              <option value="programado">Programado</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fecha de entrega
            </label>
            <input
              type="date"
              value={entregaActual.fecha}
              onChange={(e) => actualizarEntregaLocal(contrato, { fecha: e.target.value })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={cerrarEdicionEntrega}
              className="flex-1 rounded-2xl bg-slate-200 px-4 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => guardarEntrega(contrato)}
              disabled={guardandoEntregaId === contrato.id}
              className="flex-1 rounded-2xl bg-sky-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardandoEntregaId === contrato.id ? "Guardando..." : "Guardar entrega"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
