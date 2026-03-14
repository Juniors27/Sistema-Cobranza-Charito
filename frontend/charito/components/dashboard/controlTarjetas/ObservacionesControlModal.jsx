import { useState } from "react"
import { FilePenLine, MessageSquareMore, Trash2, X } from "lucide-react"

const TIPOS_CON_COMPROMISO = new Set(["promesa_pago", "reprogramado"])

const formatearFecha = (fecha) => {
  if (!fecha) return "-"

  const [year, month, day] = String(fecha).slice(0, 10).split("-")
  if (!year || !month || !day) return fecha

  return `${day}/${month}/${year}`
}

export default function ObservacionesControlModal({
  abierto,
  venta,
  observaciones,
  cargando,
  guardando,
  editandoObservacionId,
  formObservacion,
  setFormObservacion,
  guardarObservacion,
  iniciarEdicionObservacion,
  cancelarEdicionObservacion,
  borrarObservacion,
  onClose,
}) {
  const [observacionAEliminar, setObservacionAEliminar] = useState(null)

  if (!abierto || !venta) return null

  const mostrarFechaCompromiso = TIPOS_CON_COMPROMISO.has(formObservacion.tipo_resultado)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-3 text-slate-900">
              <MessageSquareMore className="h-6 w-6 text-sky-700" />
              <h3 className="text-2xl font-semibold">Observaciones de control</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Contrato {venta.numero_contrato} - {venta.nombre} {venta.apellido}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
            aria-label="Cerrar observaciones"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-slate-200 px-6 py-5 lg:border-b-0 lg:border-r">
            <h4 className="text-lg font-semibold text-slate-900">Historial</h4>

            {cargando ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
                Cargando observaciones...
              </div>
            ) : observaciones.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
                Aun no hay observaciones registradas para este contrato.
              </div>
            ) : (
              <div className="mt-4 max-h-[56vh] space-y-3 overflow-y-auto pr-1">
                {observaciones.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                        {item.tipo_resultado_label}
                      </span>
                      <span className="text-xs text-slate-500">
                        Control: {formatearFecha(item.fecha_control)}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      {item.observacion}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Registrado: {formatearFecha(item.fecha_registro)}</span>
                      <span>
                        Compromiso: {item.fecha_compromiso_pago ? formatearFecha(item.fecha_compromiso_pago) : "No aplica"}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => iniciarEdicionObservacion(item)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-200"
                      >
                        <FilePenLine className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => setObservacionAEliminar(item)}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-5">
            <h4 className="text-lg font-semibold text-slate-900">
              {editandoObservacionId ? "Editar observacion" : "Nueva observacion"}
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Registra la fecha real del control y, si existio promesa, la fecha comprometida.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha de control
                </label>
                <input
                  type="date"
                  value={formObservacion.fecha_control}
                  onChange={(e) =>
                    setFormObservacion((prev) => ({
                      ...prev,
                      fecha_control: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Resultado del control
                </label>
                <select
                  value={formObservacion.tipo_resultado}
                  onChange={(e) =>
                    setFormObservacion((prev) => ({
                      ...prev,
                      tipo_resultado: e.target.value,
                      fecha_compromiso_pago: TIPOS_CON_COMPROMISO.has(e.target.value)
                        ? prev.fecha_compromiso_pago
                        : "",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                >
                  <option value="promesa_pago">Promesa de pago</option>
                  <option value="reprogramado">Reprogramado</option>
                  <option value="no_ubicado">No ubicado</option>
                  <option value="fugado">Fugado</option>
                  <option value="bajada">Tarjeta bajada</option>
                  <option value="sin_dinero">Sin dinero</option>
                  <option value="se_niega">Se niega a pagar</option>
                  <option value="visita_pendiente">Visita pendiente</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {mostrarFechaCompromiso && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Fecha prometida de pago
                  </label>
                  <input
                    type="date"
                    value={formObservacion.fecha_compromiso_pago}
                    onChange={(e) =>
                      setFormObservacion((prev) => ({
                        ...prev,
                        fecha_compromiso_pago: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Observacion
                </label>
                <textarea
                  rows="6"
                  value={formObservacion.observacion}
                  onChange={(e) =>
                    setFormObservacion((prev) => ({
                      ...prev,
                      observacion: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                  placeholder="Escribe lo que indico el cobrador o lo observado en el control..."
                />
              </div>

              <button
                onClick={guardarObservacion}
                disabled={guardando}
                className="w-full rounded-xl bg-sky-700 p-4 text-lg font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando
                  ? "Guardando..."
                  : editandoObservacionId
                    ? "Guardar cambios"
                    : "Guardar observacion"}
              </button>

              {editandoObservacionId && (
                <button
                  onClick={cancelarEdicionObservacion}
                  className="w-full rounded-xl bg-slate-200 p-4 text-lg font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                >
                  Cancelar edicion
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {observacionAEliminar && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <h4 className="text-xl font-semibold text-slate-900">Eliminar observacion</h4>
            <p className="mt-3 text-sm text-slate-600">
              Esta accion eliminara la observacion del historial del contrato. Si solo necesitas corregir el contenido, usa editar.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setObservacionAEliminar(null)}
                className="flex-1 rounded-xl bg-slate-200 p-3 font-semibold text-slate-800 transition-colors hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await borrarObservacion(observacionAEliminar.id)
                  setObservacionAEliminar(null)
                }}
                className="flex-1 rounded-xl bg-rose-600 p-3 font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
