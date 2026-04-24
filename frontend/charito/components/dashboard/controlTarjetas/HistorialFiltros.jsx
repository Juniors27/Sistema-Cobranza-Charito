import { Clock } from "lucide-react"
import { ExportButton } from "@/components/ui"

const valueToDigits = (value = "") => value.replace(/\D/g, "")

export default function HistorialFiltros({
  filtrosBusqueda,
  setFiltrosBusqueda,
  filtro,
  setFiltro,
  clientesControlar,
  buenosPagadores,
  clientesPromesaVencida,
  conteos,
  ventasFiltradas,
  controlTarjetasExcel,
}) {
  const resumen = conteos || {
    todos: clientesControlar.length + buenosPagadores.length,
    controlar: clientesControlar.length,
    buenos: buenosPagadores.length,
    promesas_vencidas: clientesPromesaVencida.length,
  }

  const actualizarFiltroBusqueda = (campo, valor) => {
    setFiltrosBusqueda((prev) => ({
      ...prev,
      [campo]: campo === "numeroContrato" ? valueToDigits(valor) : valor,
    }))
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-gray-700">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Ano venta / lote
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={filtrosBusqueda.lote}
              onChange={(e) =>
                actualizarFiltroBusqueda("lote", valueToDigits(e.target.value).slice(0, 2))
              }
              placeholder="25"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Numero contrato
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={filtrosBusqueda.numeroContrato}
              onChange={(e) => actualizarFiltroBusqueda("numeroContrato", e.target.value)}
              placeholder="5245"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre cliente
            </label>
            <input
              type="text"
              value={filtrosBusqueda.nombreCliente}
              onChange={(e) => actualizarFiltroBusqueda("nombreCliente", e.target.value)}
              placeholder="Juan Perez"
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-700"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Clock className="w-8 h-8 mr-2 text-sky-700" />
            Control de Cobranza
          </h2>

          <div className="flex gap-2 flex-wrap">
            {["todos", "controlar", "buenos", "promesas_vencidas"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filtro === tipo
                    ? "bg-sky-700 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {tipo === "promesas_vencidas" ? "PROMESAS VENCIDAS" : tipo.toUpperCase()} ({resumen[tipo]})
              </button>
            ))}

            <ExportButton
              onClick={controlTarjetasExcel}
              disabled={ventasFiltradas.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
