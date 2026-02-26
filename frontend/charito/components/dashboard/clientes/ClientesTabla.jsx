import ClienteRow from "./ClienteRow"
import { PaginacionControles, LoadingScreen, ErrorScreen, EmptyState} from "@/components/ui"


export default function ClientesTabla({
  ventasPaginadas,
  registrosPorPagina,
  cambiarRegistrosPorPagina,
  indiceInicio,
  indiceFin,
  loading,
  error,
  totalRegistros,
  ...rest
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

  if (ventasPaginadas.length === 0) {
    return (
      <EmptyState mensaje="No hay clientes en esta categoría" />
    )
  }


  return (

    <div className="overflow-x-auto">

      {/* Controles de paginación superior */}
      <PaginacionControles
        registrosPorPagina={registrosPorPagina}
        cambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        totalRegistros={totalRegistros}
        indiceInicio={indiceInicio}
        indiceFin={indiceFin}
        label="clientes"
      />

      <table className="w-full">
        <thead>
          <tr className="bg-indigo-50 text-gray-700">
            <th className="px-4 py-3 text-left text-sm font-semibold ">Contrato</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Dirección</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Lugar</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Zona</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Producto</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Precio Venta</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Día Cobro</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Saldo</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Último Pago</th>
            <th className="px-4 py-3 text-left text-sm font-semibold ">Estado</th>
            <th className="px-4 py-3 text-center text-sm font-semibold ">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ventasPaginadas?.length > 0 ? (
            ventasPaginadas.map((venta) => (
              <ClienteRow key={venta.id} venta={venta} {...rest} />
            ))
          ) : (
            <tr>
              <td colSpan="12" className="text-center py-6 text-gray-500">
                No hay clientes para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
