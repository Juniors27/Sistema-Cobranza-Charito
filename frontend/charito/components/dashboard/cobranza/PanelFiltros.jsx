"use client"

import { Calendar, Filter, User } from "lucide-react"

export default function PanelFiltros({
  tipoFecha,
  setTipoFecha,
  cobradores,
  filtros,
  handleFiltroChange,
  aplicarFiltros,
  limpiarFiltros,
}) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Reporte de Cobranza
        </h2>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setTipoFecha("simple")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tipoFecha === "simple"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Fecha Simple
        </button>
        <button
          onClick={() => setTipoFecha("rango")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tipoFecha === "rango"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Rango de Fechas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tipoFecha === "simple" ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Seleccionar Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={filtros.fecha}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Cobrador
          </label>
          <select
            name="cobrador"
            value={filtros.cobrador}
            onChange={handleFiltroChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
          >
            <option value="">Seleccionar cobrador</option>
            {cobradores?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} - {c.zona}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={aplicarFiltros}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >          
          Aplicar Filtros
        </button>
        <button
          onClick={limpiarFiltros}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
