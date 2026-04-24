import { ExportButton } from "@/components/ui"

const valueToDigits = (value = "") => value.replace(/\D/g, "")

export default function ClientesFiltros({
  filtrosBusqueda,
  setFiltrosBusqueda,
  zonaFiltro,
  setZonaFiltro,
  exportarExcel,
}) {
  const actualizarFiltro = (campo, valor) => {
    setFiltrosBusqueda((prev) => ({
      ...prev,
      [campo]: campo === "numeroContrato" ? valueToDigits(valor) : valor,
    }))
  }

  return (
    <div className="mb-6 space-y-4 text-gray-700">
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
            onChange={(e) => actualizarFiltro("lote", valueToDigits(e.target.value).slice(0, 2))}
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
            onChange={(e) => actualizarFiltro("numeroContrato", e.target.value)}
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
            onChange={(e) => actualizarFiltro("nombreCliente", e.target.value)}
            placeholder="Juan Perez"
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-700"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
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

        <ExportButton onClick={exportarExcel} />
      </div>
    </div>
  )
}
