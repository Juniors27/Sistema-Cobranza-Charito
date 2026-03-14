import { useRef } from "react"
import { CheckCircle, Edit2, Trash2, X } from "lucide-react"
import { usePagos } from "@/src/hooks/usePagos"

export default function PagosForm(props) {
  const contratoInputRef = useRef(null)
  const montoInputRef = useRef(null)
  const registrarPagoButtonRef = useRef(null)

  const {
    cobradores,
    fechaPagoBatch,
    setFechaPagoBatch,
    cobradorBatch,
    setCobradorBatch,
    formPago,
    setFormPago,
    modoEdicion,
    pagoEditando,
    contratoActual,
    esPrimerPagoContrato,
    buscarUltimoPago,
    registrarPago,
    editarPago,
    eliminarPago,
    registrarDescuento,
    cancelarEdicion,
  } = props

  const enfocarContrato = () => {
    contratoInputRef.current?.focus()
    contratoInputRef.current?.select()
  }

  const handleContratoKeyDown = (e) => {
    if (e.key !== "Enter" || modoEdicion) return
    e.preventDefault()
    montoInputRef.current?.focus()
    montoInputRef.current?.select()
  }

  const handleMontoKeyDown = (e) => {
    if (e.key !== "Enter" || modoEdicion) return
    e.preventDefault()
    registrarPagoButtonRef.current?.focus()
  }

  const handleRegistrarPagoKeyDown = async (e) => {
    if (e.key !== "Enter" || modoEdicion) return
    e.preventDefault()

    const registrado = await registrarPago()

    if (registrado) {
      enfocarContrato()
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-sky-50 to-slate-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-6">
          <h1 className="text-4xl font-semibold text-slate-900 mb-2">
            Registro de Pagos
          </h1>
          <p className="text-slate-500">
            Registra, edita o elimina los pagos recibidos de los clientes
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center">
            <CheckCircle className="w-8 h-8 mr-2 text-sky-700" />
            {modoEdicion ? "Editar Pago" : "Registro de Pagos"}
          </h2>

          {modoEdicion && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-amber-800">Modo Edicion Activo</p>
                <p className="text-sm text-amber-700">
                  Editando ultimo pago: S/ {pagoEditando?.monto} del {pagoEditando?.fecha_pago}
                </p>
              </div>
              <button
                onClick={cancelarEdicion}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
              >
                <X className="w-4 h-4 mr-2 inline" />
                Cancelar
              </button>
            </div>
          )}

          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Configuracion de Lote
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fecha de Cobro
                </label>
                <input
                  type="date"
                  value={fechaPagoBatch}
                  onChange={(e) => setFechaPagoBatch(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-sky-600 focus:outline-none text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cobrador
                </label>
                <select
                  value={cobradorBatch}
                  onChange={(e) => setCobradorBatch(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-sky-600 focus:outline-none text-slate-800 bg-white"
                >
                  <option value="">Seleccionar cobrador</option>
                  {cobradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} - {c.zona}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Numero de Contrato (Tarjeta)
                </label>

                <div className="flex gap-2">
                  <input
                    ref={contratoInputRef}
                    type="text"
                    value={formPago.numeroContrato}
                    onChange={(e) =>
                      setFormPago({
                        ...formPago,
                        numeroContrato: e.target.value,
                      })
                    }
                    onKeyDown={handleContratoKeyDown}
                    disabled={modoEdicion}
                    className="flex-1 p-3 border border-slate-300 rounded-xl focus:border-sky-600 focus:outline-none disabled:bg-slate-100 text-slate-800 bg-white"
                  />

                  {!modoEdicion && (
                    <button
                      onClick={buscarUltimoPago}
                      className="bg-amber-500 text-white px-4 py-3 rounded-xl hover:bg-amber-600 transition"
                      title="Buscar ultimo pago"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {contratoActual && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="font-semibold text-slate-900">
                    {contratoActual.nombre} {contratoActual.apellido}
                  </div>
                  <div className="text-sm text-slate-500">
                    {contratoActual.producto}
                  </div>
                  <div className="text-lg font-bold text-rose-600 mt-2">
                    Saldo: S/ {Number(contratoActual.saldo_pendiente).toFixed(2)}
                  </div>
                </div>
              )}

              {esPrimerPagoContrato && !modoEdicion && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                  <p className="text-sm text-sky-700">
                    Este es el primer pago registrado para este contrato.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Monto del Pago
                </label>
                <input
                  ref={montoInputRef}
                  type="number"
                  value={formPago.monto}
                  onChange={(e) =>
                    setFormPago({
                      ...formPago,
                      monto: e.target.value,
                    })
                  }
                  onKeyDown={handleMontoKeyDown}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-sky-600 focus:outline-none text-slate-800 bg-white"
                />
              </div>

              {modoEdicion ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={editarPago}
                    className="bg-emerald-600 text-white p-4 rounded-xl font-semibold hover:bg-emerald-700 transition"
                  >
                    <Edit2 className="w-5 h-5 inline mr-2" />
                    Guardar Cambios
                  </button>

                  <button
                    onClick={eliminarPago}
                    className="bg-red-600 text-white p-4 rounded-xl font-semibold hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-5 h-5 inline mr-2" />
                    Eliminar Pago
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    ref={registrarPagoButtonRef}
                    onClick={registrarPago}
                    onKeyDown={handleRegistrarPagoKeyDown}
                    className="w-full bg-sky-700 text-white p-4 rounded-xl text-lg font-semibold hover:bg-sky-800 transition focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <CheckCircle className="w-6 h-6 inline mr-2" />
                    Registrar Pago
                  </button>
                  <button
                    onClick={registrarDescuento}
                    className="bg-rose-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-rose-700 transition"
                  >
                    Aplicar Descuento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
