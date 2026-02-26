import { RefreshCw } from "lucide-react"

export function SectionHeader({
  titulo,
  subtitulo,
  onRefresh,
  textoBoton = "Actualizar",
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            {titulo}
          </h1>
          <p className="text-gray-600">
            {subtitulo}
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {textoBoton}
          </button>
        )}
      </div>
    </div>
  )
}