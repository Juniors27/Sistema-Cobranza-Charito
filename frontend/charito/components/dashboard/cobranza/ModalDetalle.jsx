"use client"

import { Printer, X } from "lucide-react"
import { calcularTotalPagado } from "@/src/utils/reporteUtils"

export default function ModalDetalle({
  
  pagoSeleccionado,  
  historialPagos,
  cargandoHistorial,
  cerrarModal,
  printRef,
}) {
 

  return (
     
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={printRef} className="tarjeta-print bg-white rounded-2xl shadow-2xl">
            {/* Encabezado del Modal */}
            <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">Comercial "CHARITO"</h2>
                <p className="text-indigo-100">Detalles del Contrato</p>
              </div>
              <div>
                <button
                  onClick={() => window.print()}
                  className="text-white p-2 rounded-lg hover:bg-white/20"
                  title="Imprimir tarjeta"
                >
                  <Printer className="w-6 h-6" />
                </button>

                <button
                  onClick={cerrarModal}
                  className="text-white hover:bg-indigo-200 hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-8 space-y-6">
              {/* Información Principal */}
              <div className="border-l-4 border-indigo-600 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">CONTRATO N°</h3>
                <p className="text-2xl font-bold text-indigo-600">{pagoSeleccionado.numeroContrato}</p>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">CLIENTE</p>
                  <p className="text-lg font-bold text-gray-800">{pagoSeleccionado.cliente}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">DIRECCIÓN</p>
                  <p className="text-lg font-bold text-gray-800">{pagoSeleccionado.direccion || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">LUGAR / ZONA</p>
                  <p className="text-lg font-bold text-gray-800">{pagoSeleccionado.zona?.toUpperCase() || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">PRODUCTO</p>
                  <p className="text-lg font-bold text-gray-800">{pagoSeleccionado.producto?.toUpperCase() || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">COBRADOR</p>
                  <p className="text-lg font-bold text-gray-800">{pagoSeleccionado.cobradorNombre?.toUpperCase() || 'N/A'}</p>
                </div>
              </div>

              {/* Tabla de Historial de Pagos */}
              <div className="border-t-2 border-gray-200 pt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">HISTORIAL DE PAGOS</h4>

                {cargandoHistorial ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Cargando historial...</p>
                  </div>
                ) : historialPagos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="text-left py-2 px-3 font-bold text-gray-700">FECHA PAGO</th>
                          <th className="text-right py-2 px-3 font-bold text-gray-700">MONTO</th>
                          <th className="text-right py-2 px-3 font-bold text-gray-700">SALDO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialPagos.map((pago, index) => (
                          <tr key={pago.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-600">{pago.fecha_pago}</td>                            
                            <td className="py-2 px-3 text-right text-green-600 font-semibold">
                              S/ {Number(pago.monto).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right text-red-600 font-semibold">
                              S/ {Number(pago.saldo_despues_pago).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No se encontró historial de pagos</p>
                  </div>
                )}
              </div>

              {/* Resumen Financiero */}
              <div className="bg-linear-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                  <div>
                    <p className="text-xs text-gray-600 font-semibold">SALDO PENDIENTE</p>
                    <p className="text-xl font-bold text-red-600">
                      S/ {Number(pagoSeleccionado.saldo_pendiente || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">TOTAL PAGADO</p>
                    <p className="text-xl font-bold text-green-600">
                      S/ {calcularTotalPagado(historialPagos)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}
