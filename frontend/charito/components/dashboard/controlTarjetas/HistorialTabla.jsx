import { MapPin } from "lucide-react"

import { PaginacionControles, LoadingScreen, ErrorScreen, EmptyState} from "@/components/ui"

export default function HistorialTabla({
    datosPaginados,
    cobradores,
    loading,
    error,
    calcularEstadoAutomatico,
    esBuenPagador,
    obtenerUltimoPago,   
    registrosPorPagina,
    indiceInicio,
    indiceFin,
    totalRegistros,
    cambiarRegistrosPorPagina,
}) {
  



    if (loading) {
        return <LoadingScreen mensaje="Cargando clientes..." />
    }

    if (error) {
        return (
            <ErrorScreen
                mensaje={error}
                onRetry={cargarDatos}
            />
        )
    }

    if (datosPaginados.length === 0) {
        return (
            <EmptyState mensaje="No hay clientes en esta categoría" />
        )
    }


    return (
        <>
            <div className="overflow-x-auto">

                {/* Controles de paginación superior */}
                <PaginacionControles
                    registrosPorPagina={registrosPorPagina}
                    cambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
                    totalRegistros={totalRegistros}
                    indiceInicio={indiceInicio}
                    indiceFin={indiceFin}
                />

                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 text-gray-800">
                            <th className="px-4 py-3 text-left text-sm font-semibold">Contrato</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Dirección</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Zona</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Frecuencia</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Último Pago</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Días sin Pago</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Saldo</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Cobrador</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                        </tr>
                    </thead>

                    <tbody>
                        {datosPaginados.map((ventas) => {
                            const estado = calcularEstadoAutomatico(ventas)
                            const cobrador = cobradores.find((c) => c.id === ventas.cobrador)
                            const ultimoPago = obtenerUltimoPago(ventas)
                            const bueno = esBuenPagador(ventas)

                            return (
                                <tr
                                    key={ventas.id}
                                    className={`border-b hover:bg-gray-50 ${estado === "controlar"
                                        ? "bg-red-50"
                                        : bueno
                                            ? "bg-green-50"
                                            : ""
                                        } text-gray-800 text-sm`}
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {ventas.numero_contrato}
                                    </td>
                                    <td className="px-4 py-3">
                                        {ventas.nombre} {ventas.apellido}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <span>{ventas.direccion}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 capitalize">{ventas.zona}</td>
                                    <td className="px-4 py-3 capitalize">{ventas.frecuencia_pago}</td>
                                    <td className="px-4 py-3">{ultimoPago.fecha}</td>
                                    <td className="px-4 py-3 font-semibold">{ultimoPago.dias} días</td>
                                    <td className="px-4 py-3 font-semibold">
                                        S/ {parseFloat(ventas.saldo_pendiente).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">{cobrador?.nombre || "-"}</td>
                                    <td className="px-4 py-3 text-center">
                                        {estado === "controlar" ? (
                                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">
                                                CONTROL
                                            </span>
                                        ) : bueno ? (
                                            <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                                                AL DÍA
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold">
                                                NORMAL
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            
        </>
    )
}