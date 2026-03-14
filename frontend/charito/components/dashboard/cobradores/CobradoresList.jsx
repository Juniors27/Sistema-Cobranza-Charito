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
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-sky-300 hover:bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-900">
                  {cobrador.nombre}
                </h4>

                <p className="mt-1 flex items-center text-sm capitalize text-slate-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {cobrador.zona}
                </p>

                <p className="mt-2 text-sm font-semibold text-sky-700">
                  {cantidadClientes} cliente
                  {cantidadClientes !== 1 ? "s" : ""} activo
                  {cantidadClientes !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditar(cobrador)}
                  className="rounded-lg bg-sky-100 p-2 text-sky-700 hover:bg-sky-200"
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
