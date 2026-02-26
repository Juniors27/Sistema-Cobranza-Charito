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
  ventasFiltradas,
  controlTarjetasExcel
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex flex-col gap-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por contrato, nombre, dirección..."
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Clock className="w-8 h-8 mr-2 text-red-600" />
            Control de Cobranza
          </h2>

          <div className="flex gap-2 flex-wrap">
            {["todos", "controlar", "buenos"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filtro === tipo
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {tipo.toUpperCase()} (
                {tipo === "todos"
                  ? clientesControlar.length + buenosPagadores.length
                  : tipo === "controlar"
                    ? clientesControlar.length
                    : buenosPagadores.length}
                )
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