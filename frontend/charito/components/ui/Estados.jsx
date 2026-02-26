import { RefreshCw, AlertCircle } from "lucide-react"

/* =========================
   LOADING
========================== */
export function LoadingScreen({ mensaje = "Cargando datos..." }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-xl text-gray-700">{mensaje}</p>
      </div>
    </div>
  )
}

/* =========================
   ERROR
========================== */
export function ErrorScreen({
  mensaje,
  onRetry,
  titulo = "Error al cargar datos",
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {titulo}
        </h2>
        <p className="text-gray-600 text-center mb-4">{mensaje}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}

/* =========================
   EMPTY
========================== */
export function EmptyState({
  mensaje = "No hay registros",
}) {
  return (
    <div className="text-center py-12 text-gray-500">
      <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p className="text-xl">{mensaje}</p>
    </div>
  )
}