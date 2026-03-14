
export  function PaginacionControles({
    registrosPorPagina,
    cambiarRegistrosPorPagina,
    totalRegistros,
    indiceInicio,
    indiceFin,
    label = "registros",
}) {
    return (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mostrar:</span>

                <select
                    value={registrosPorPagina}
                    onChange={(e) =>
                        cambiarRegistrosPorPagina(Number(e.target.value))
                    }
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>

                <span className="text-sm text-gray-600">{label}</span>
            </div>

            <div className="text-sm text-gray-600">
                {totalRegistros > 0 ? (
                    <span>
                        Mostrando {indiceInicio + 1} a{" "}
                        {Math.min(indiceFin, totalRegistros)} de{" "}
                        {totalRegistros} {label}
                    </span>
                ) : (
                    <span>No hay {label}</span>
                )}
            </div>
        </div>
    )
}
