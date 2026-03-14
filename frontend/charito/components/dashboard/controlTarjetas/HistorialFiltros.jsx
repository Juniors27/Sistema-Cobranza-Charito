import { Clock } from "lucide-react"
import { SearchInput, ExportButton } from "@/components/ui"
import { exportarExcel } from "@/src/utils/clientesUtils"

export default function HistorialFiltros({
  searchTerm,
  setSearchTerm,
  filtro,
  setFiltro,
  clientesControlar,
  buenosPagadores,
  clientesPromesaVencida,
  ventasFiltradas,
  controlTarjetasExcel
}) {
  const conteos = {
    todos: clientesControlar.length + buenosPagadores.length,
    controlar: clientesControlar.length,
    buenos: buenosPagadores.length,
    promesas_vencidas: clientesPromesaVencida.length,
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-gray-700">
      <div className="flex flex-col gap-4 ">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por contrato, nombre, dirección..."
        />

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
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filtro === tipo
                  ? "bg-sky-700 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
              >
                {tipo === "promesas_vencidas" ? "PROMESAS VENCIDAS" : tipo.toUpperCase()} ({conteos[tipo]})
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
