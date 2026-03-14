import { Edit, Trash2, Package, ArrowDownCircle, Eye } from "lucide-react"
import { calcularEstadoAutomatico, obtenerColorEstado, obtenerFechaReferenciaPago } from "@/src/utils/clientesUtils"

export default function ClienteRow({
    venta,
    abrirModalDetalle,
    abrirModalEditar,
    cambiarEstadoVenta,
    solicitarEliminarVenta,
    //calcularEstadoAutomatico,
    //obtenerColorEstado
}) {
    const estadoActual = calcularEstadoAutomatico(venta)

    return (
        <tr className="border-b hover:bg-gray-50 text-gray-800">
            <td className="px-4 py-3 text-sm font-medium">
                {venta.numero_contrato}
            </td>

            <td className="px-4 py-3 text-sm">
                {venta.nombre} {venta.apellido}
                <div className="text-xs text-gray-500">
                    {venta.cobrador_nombre}
                </div>
            </td>

            <td className="px-4 py-3 text-sm">{venta.direccion}</td>
            <td className="px-4 py-3 text-sm">{venta.lugar}</td>

            <td className="px-4 py-3 text-sm capitalize">
                {venta.zona?.toUpperCase()}
            </td>
            <td className="px-4 py-3 text-sm">{venta.producto_nombre?.toUpperCase()}</td>
            <td className="px-4 py-3 text-sm">{venta.precio_total}</td>
            <td className="px-4 py-3 text-sm">{venta.dia_cobro}</td>
            <td className="px-4 py-3 text-sm font-semibold">S/ {Number(venta.saldo_pendiente ?? 0).toFixed(2)}</td>
            <td className="px-4 py-3 text-sm">
                {obtenerFechaReferenciaPago(venta)}
            </td>

            {/*  Estado usando obtenerColorEstado */}
            <td className="px-4 py-3">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${obtenerColorEstado(
                        estadoActual
                    )}`}
                >
                    {estadoActual.charAt(0).toUpperCase() + estadoActual.slice(1)}
                </span>
            </td>

            <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => abrirModalDetalle(venta)}
                        className="rounded-lg bg-sky-100 p-2 text-sky-700 hover:bg-sky-200"
                        aria-label={`Ver detalle de ${venta.nombre} ${venta.apellido}`}
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => abrirModalEditar(venta)}
                        className="rounded-lg bg-sky-100 p-2 text-sky-700 hover:bg-sky-200"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() =>
                            cambiarEstadoVenta(venta.numero_contrato, "recogido")
                        }
                        disabled={venta.estado === "cancelado"}
                        className={`p-2 rounded-lg ${venta.estado === "cancelado"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                            }`}
                    >
                        <Package className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() =>
                            cambiarEstadoVenta(venta.numero_contrato, "bajada")
                        }
                        disabled={venta.estado === "cancelado"}
                        className={`p-2 rounded-lg ${venta.estado === "cancelado"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                    >
                        <ArrowDownCircle className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => solicitarEliminarVenta(venta)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    )
}
