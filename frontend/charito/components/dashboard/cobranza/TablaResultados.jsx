"use client"

import { Eye, X } from "lucide-react"
import { calcularTotalMonto } from "@/src/utils/reporteUtils"

export default function TablaResultados({
  data,
  abrirModal,
}) {


  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Pagos Filtrados ({data.length})
      </h3>

      <div className="bg-linear-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200 mb-4">
        <p className="text-sm text-gray-600">Total Dinero Ingresado</p>
        <p className="text-3xl font-bold text-indigo-600">
          S/ {calcularTotalMonto(data).toFixed(2)}
        </p>
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900">
                <th className="text-left py-4 px-6 font-semibold">Tarjeta</th>
                <th className="text-center py-4 px-6 font-semibold">Cliente</th>
                <th className="text-right py-4 px-6 font-semibold">Pago</th>
                <th className="text-right py-4 px-6 font-semibold">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pago) => (
                <tr key={pago.id} className="border-b text-black hover:bg-gray-50">
                  <td className="py-4 px-4 font-semibold text-left">
                    {pago.numeroContrato}
                  </td>
                  <td className="text-center">{pago.cliente}</td>
                  <td className="text-right text-green-600 font-bold">
                    S/ {Number(pago.monto).toFixed(2)}
                  </td>
                  <td className="text-right text-red-600 font-bold">
                    S/ {Number(pago.saldo_pendiente).toFixed(2)}
                  </td>
                  <td className="text-center">
                    <button onClick={() => abrirModal(pago)}>
                      <Eye className="w-5 h-5 text-indigo-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <X className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron pagos</p>
        </div>
      )}
    </div>
  )
}
