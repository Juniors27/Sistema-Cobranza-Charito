import { MapPin, MessageSquareMore } from "lucide-react"

import { PaginacionControles, LoadingScreen, ErrorScreen, EmptyState } from "@/components/ui"

export default function HistorialTabla({
  datosPaginados,
  loading,
  error,
  abrirModalObservaciones,
  cargarDatos,
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
    return <ErrorScreen mensaje={error} onRetry={cargarDatos} />
  }

  if (datosPaginados.length === 0) {
    return <EmptyState mensaje="No hay clientes en esta categoria" />
  }

  return (
    <>
      <div className="overflow-x-auto">
        <PaginacionControles
          registrosPorPagina={registrosPorPagina}
          cambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
          totalRegistros={totalRegistros}
          indiceInicio={indiceInicio}
          indiceFin={indiceFin}
        />

        <table className="w-full">
          <thead>
            <tr className="bg-sky-50 text-gray-800">
              <th className="px-4 py-3 text-left text-sm font-semibold">Contrato</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Direccion</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Zona</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Frecuencia</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ultimo Pago</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tiempo sin Pago</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Saldo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cobrador</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Observaciones</th>
            </tr>
          </thead>

          <tbody>
            {datosPaginados.map((ventas) => {
              const estado = ventas.estado_control
              const ultimoPago = ventas.ultimo_pago
              const alertaPromesa = ventas.alerta_promesa
              const bueno = ventas.es_buen_pagador

              return (
                <tr
                  key={ventas.id}
                  className={`border-b text-sm text-gray-800 hover:bg-gray-50 ${
                    estado === "controlar"
                      ? "bg-red-50"
                      : bueno
                        ? "bg-green-50"
                        : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{ventas.numero_contrato}</td>
                  <td className="px-4 py-3">
                    {ventas.nombre} {ventas.apellido}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{ventas.direccion}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{ventas.zona}</td>
                  <td className="px-4 py-3 capitalize">{ventas.frecuencia_pago}</td>
                  <td className="px-4 py-3">{ultimoPago.fecha}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{ultimoPago.atraso}</div>
                    {alertaPromesa && (
                      <div
                        className={`mt-2 inline-flex flex-col rounded-lg px-2 py-1 text-xs font-semibold ${
                          alertaPromesa.tipo === "vencida"
                            ? "bg-rose-100 text-rose-700"
                            : alertaPromesa.tipo === "hoy"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        <span>{alertaPromesa.texto}</span>
                        <span className="font-normal">{alertaPromesa.detalle}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    S/ {parseFloat(ventas.saldo_pendiente).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{ventas.cobrador_nombre || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    {estado === "controlar" ? (
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                        CONTROL
                      </span>
                    ) : bueno ? (
                      <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        AL DIA
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
                        NORMAL
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => abrirModalObservaciones(ventas)}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-200"
                    >
                      <MessageSquareMore className="h-4 w-4" />
                      Ver
                    </button>
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
