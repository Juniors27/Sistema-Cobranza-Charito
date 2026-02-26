import { SearchInput, ExportButton } from "@/components/ui"

export default function ClientesFiltros({
  searchTerm,
  setSearchTerm,
  zonaFiltro,
  setZonaFiltro,
  exportarExcel
}) {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4 text-gray-700">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por contrato, nombre, dirección..."
      />

      <select
        value={zonaFiltro}
        onChange={(e) => setZonaFiltro(e.target.value)}
        className="px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700"
      >
        <option value="todas">Todas las zonas</option>
        <option value="milagro">Milagro</option>
        <option value="huanchaco">Huanchaco</option>
        <option value="buenos aires">Buenos Aires</option>
      </select>

      <ExportButton
       onClick={exportarExcel} />
      
    </div>
  )
}
