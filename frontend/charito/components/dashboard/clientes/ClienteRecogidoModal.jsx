import { formatearFechaDMY } from "@/src/utils/clientesUtils"

export default function ClienteRecogidoModal({
  abierto,
  venta,
  formRecogido,
  guardando,
  actualizarFormRecogido,
  confirmarCambioRecogido,
  cerrarModalRecogido,
}) {
  if (!abierto || !venta) return null

  const estaRecogido = venta.estado === "recogido"
  const esReversion = formRecogido.accion === "revertir"
  const permiteFecha =
    formRecogido.accion === "marcar" || formRecogido.accion === "actualizar"

  const titulo = esReversion
    ? "Revertir recojo"
    : estaRecogido
      ? "Actualizar recojo"
      : "Registrar recojo"

  const descripcion = esReversion
    ? "Este contrato ya está marcado como recogido. Confirma si deseas revertir la acción."
    : estaRecogido
      ? "Puedes corregir o completar la fecha de recojo sin cambiar el estado del contrato."
      : "Selecciona la fecha en la que se recogió el producto para dejar el contrato correctamente registrado."

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-2xl font-semibold text-slate-900">{titulo}</h3>

        <p className="mt-3 text-sm text-slate-600">{descripcion}</p>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-sm font-semibold text-slate-900">
            {venta.numero_contrato} - {venta.nombre} {venta.apellido}
          </div>
          <div className="mt-1 text-sm text-slate-600">{venta.direccion}</div>
          {venta.fecha_recogido && (
            <div className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-orange-700">
              Recogido el {formatearFechaDMY(venta.fecha_recogido)}
            </div>
          )}
        </div>

        {estaRecogido && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => actualizarFormRecogido("accion", "actualizar")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                formRecogido.accion === "actualizar"
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Actualizar fecha
            </button>
            <button
              type="button"
              onClick={() => actualizarFormRecogido("accion", "revertir")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                formRecogido.accion === "revertir"
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Revertir estado
            </button>
          </div>
        )}

        {permiteFecha && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fecha de recojo
            </label>
            <input
              type="date"
              value={formRecogido.fechaRecogido}
              onChange={(e) => actualizarFormRecogido("fechaRecogido", e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
            />
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={cerrarModalRecogido}
            disabled={guardando}
            className="flex-1 rounded-xl bg-slate-200 p-3 font-semibold text-slate-800 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarCambioRecogido}
            disabled={guardando}
            className={`flex-1 rounded-xl p-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              esReversion
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {guardando
              ? "Guardando..."
              : esReversion
                ? "Sí, revertir"
                : estaRecogido
                  ? "Guardar fecha"
                  : "Guardar recojo"}
          </button>
        </div>
      </div>
    </div>
  )
}
