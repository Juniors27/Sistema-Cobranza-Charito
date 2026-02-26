import { ChevronLeft, ChevronRight } from "lucide-react"

export  function Paginacion({
  paginaActual,
  totalPaginas,
  paginaAnterior,
  paginaSiguiente,
  irAPagina
}) {
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600">
        Página {paginaActual} de {totalPaginas}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={paginaAnterior}
          disabled={paginaActual === 1}
          className={`p-2 rounded-lg transition-colors ${
            paginaActual === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            let numeroPagina

            if (totalPaginas <= 5) {
              numeroPagina = i + 1
            } else if (paginaActual <= 3) {
              numeroPagina = i + 1
            } else if (paginaActual >= totalPaginas - 2) {
              numeroPagina = totalPaginas - 4 + i
            } else {
              numeroPagina = paginaActual - 2 + i
            }

            return (
              <button
                key={numeroPagina}
                onClick={() => irAPagina(numeroPagina)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  paginaActual === numeroPagina
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {numeroPagina}
              </button>
            )
          })}
        </div>

        <button
          onClick={paginaSiguiente}
          disabled={paginaActual === totalPaginas}
          className={`p-2 rounded-lg transition-colors ${
            paginaActual === totalPaginas
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
