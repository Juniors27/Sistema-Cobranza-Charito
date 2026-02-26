import { CheckCircle, Edit2, Trash2, X } from "lucide-react"
import { usePagos } from "@/src/hooks/usePagos"

export default function PagosForm(props) {
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

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            Registro de Pagos
          </h1>
          <p className="text-gray-600">
            Registra, edita o elimina los pagos recibidos de los clientes
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="w-8 h-8 mr-2 text-blue-600" />
            {modoEdicion ? "Editar Pago" : "Registro de Pagos"}
          </h2>

          {/* Banner edición */}
          {modoEdicion && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-amber-800">Modo Edición Activo</p>
                <p className="text-sm text-amber-700">
                  Editando último pago: S/ {pagoEditando?.monto} del {pagoEditando?.fecha_pago}
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

          {/* Configuración de lote */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Configuración de Lote
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Cobro
                </label>
                <input
                  type="date"
                  value={fechaPagoBatch}
                  onChange={(e) => setFechaPagoBatch(e.target.value)}
                  className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cobrador
                </label>
                <select
                  value={cobradorBatch}
                  onChange={(e) => setCobradorBatch(e.target.value)}
                  className="w-full p-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none  text-gray-800"
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

          {/* Formulario */}
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="space-y-4">

              {/* Número contrato */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Contrato (Tarjeta)
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formPago.numeroContrato}
                    onChange={(e) =>
                      setFormPago({
                        ...formPago,
                        numeroContrato: e.target.value,
                      })
                    }
                    disabled={modoEdicion}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100  text-gray-800"
                  />

                  {!modoEdicion && (
                    <button
                      onClick={buscarUltimoPago}
                      className="bg-amber-500 text-white px-4 py-3 rounded-xl hover:bg-amber-600 transition"
                      title="Buscar último pago"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Info contrato */}
              {contratoActual && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="font-semibold text-gray-800">
                    {contratoActual.nombre} {contratoActual.apellido}
                  </div>
                  <div className="text-sm text-gray-600">
                    {contratoActual.producto}
                  </div>
                  <div className="text-lg font-bold text-red-600 mt-2">
                    Saldo: S/ {Number(contratoActual.saldo_pendiente).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Primer pago */}
              {esPrimerPagoContrato && !modoEdicion && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    Este es el primer pago registrado para este contrato.
                  </p>
                </div>
              )}

              {/* Monto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monto del Pago
                </label>
                <input
                  type="number"
                  value={formPago.monto}
                  onChange={(e) =>
                    setFormPago({
                      ...formPago,
                      monto: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none  text-gray-800"
                />
              </div>

              {/* Botones */}
              {modoEdicion ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={editarPago}
                    className="bg-green-600 text-white p-4 rounded-xl font-semibold hover:bg-green-700 transition"
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
                    onClick={registrarPago}
                    className="w-full bg-blue-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <CheckCircle className="w-6 h-6 inline mr-2" />
                    Registrar Pago
                  </button>
                  <button
                    onClick={registrarDescuento}
                    className="bg-red-500 text-white p-4 rounded-xl text-lg font-semibold hover:bg-red-700 transition"
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
