import { UserCheck, MapPin, Edit, Trash2 } from "lucide-react"

const CobradoresList = ({
  cobradores,
  onEditar,
  onEliminar,
}) => {

  if (cobradores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-xl">No hay cobradores registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cobradores.map((cobrador) => {
        const cantidadClientes = Number(cobrador.total_clientes_activos ?? 0)

        return (
          <div
            key={cobrador.id}
            className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg">
                  {cobrador.nombre}
                </h4>

                <p className="text-sm text-gray-600 capitalize flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {cobrador.zona}
                </p>

                <p className="text-sm font-semibold text-indigo-600 mt-2">
                  {cantidadClientes} cliente
                  {cantidadClientes !== 1 ? "s" : ""} activo
                  {cantidadClientes !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditar(cobrador)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onEliminar(cobrador.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CobradoresList
