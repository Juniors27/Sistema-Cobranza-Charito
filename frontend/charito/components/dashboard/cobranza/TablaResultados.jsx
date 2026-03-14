"use client"

import { Eye, Search, X } from "lucide-react"
import { calcularTotalMonto } from "@/src/utils/reporteUtils"

export default function TablaResultados({
  data,
  searchTerm,
  setSearchTerm,
  abrirModal,
}) {
  const totalCancelados = data.filter(
    (pago) => pago.estado === "cancelado" || Number(pago.saldo_pendiente) === 0
  ).length

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

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por contrato o nombre del cliente"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
          />
        </div>

        <div className="text-sm text-gray-600">
          Contratos cancelados en este resultado:{" "}
          <span className="font-semibold text-red-600">{totalCancelados}</span>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900">
                <th className="text-left py-4 px-6 font-semibold">Tarjeta</th>
                <th className="text-center py-4 px-6 font-semibold">Cliente</th>
                <th className="text-center py-4 px-6 font-semibold">Estado</th>
                <th className="text-right py-4 px-6 font-semibold">Pago</th>
                <th className="text-right py-4 px-6 font-semibold">Saldo</th>
                <th className="text-center py-4 px-6 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pago) => {
                const esCancelado =
                  pago.estado === "cancelado" || Number(pago.saldo_pendiente) === 0

                return (
                  <tr
                    key={pago.id}
                    className={`border-b text-black hover:bg-gray-50 ${
                      esCancelado ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="py-4 px-4 font-semibold text-left">
                      {pago.numeroContrato}
                    </td>
                    <td className="text-center">{pago.cliente}</td>
                    <td className="text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          esCancelado
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {esCancelado ? "Cancelado" : "Con saldo"}
                      </span>
                    </td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <X className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron resultados para esa búsqueda o filtro</p>
        </div>
      )}
    </div>
  )
}
