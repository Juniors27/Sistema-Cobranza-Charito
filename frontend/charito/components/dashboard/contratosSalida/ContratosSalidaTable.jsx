import { FilePenLine, Search } from "lucide-react"
import { Paginacion, PaginacionControles } from "@/components/ui"
import {
  formatearFechaContratoSalida,
  formatearMontoContratoSalida,
  obtenerEstadoPrimerPagoContratoSalida,
} from "./contratosSalidaUtils"

function ContratoSalidaRow({ contrato, onEditarEntrega }) {
  const estadoPrimerPago = obtenerEstadoPrimerPagoContratoSalida(contrato)

  return (
    <tr
      className={`border-t border-slate-100 transition-colors odd:bg-white even:bg-sky-50/30 hover:bg-cyan-50/70 ${
        contrato.estado?.toLowerCase() === "recogido" ? "opacity-80" : ""
      }`}
    >
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {formatearFechaContratoSalida(contrato.fecha_primer_cobro)}
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-slate-900">{contrato.numero_contrato}</td>
      <td className="px-4 py-3 text-slate-700">
        <div className="font-medium text-slate-800">{contrato.cliente}</div>
      </td>
      <td className="px-4 py-3 text-slate-700">
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
          {contrato.cobrador_nombre}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-600">
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              contrato.entregado_cobrador
                ? "bg-cyan-100 text-cyan-800"
                : contrato.fecha_entrega_cobrador
                  ? "bg-violet-100 text-violet-800"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {contrato.entregado_cobrador
              ? "Entregado"
              : contrato.fecha_entrega_cobrador
                ? "Programado"
                : "Pendiente de entrega"}
          </span>
          <span className="text-xs text-slate-500">
            {contrato.fecha_entrega_cobrador
              ? formatearFechaContratoSalida(contrato.fecha_entrega_cobrador)
              : "Sin fecha"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">
        {formatearFechaContratoSalida(contrato.fecha_venta)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoPrimerPago.clases}`}
        >
          {estadoPrimerPago.etiqueta}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-semibold text-rose-700">
        {formatearMontoContratoSalida(contrato.saldo_pendiente)}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onEditarEntrega(contrato)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 transition-colors hover:bg-sky-100"
          aria-label={`Editar contrato ${contrato.numero_contrato}`}
          title="Editar contrato"
        >
          <FilePenLine className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default function ContratosSalidaTable({
  filtroTodosActivo,
  setCobradorFiltro,
  totalRegistros,
  busqueda,
  setBusqueda,
  contratosSalida,
  contratosSalidaPaginados,
  registrosPorPagina,
  cambiarRegistrosPorPagina,
  indiceInicio,
  indiceFin,
  totalPaginas,
  paginaActual,
  paginaAnterior,
  paginaSiguiente,
  irAPagina,
  onEditarEntrega,
}) {
  return (
    <section className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Historial detallado
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Contratos programados y entregados
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!filtroTodosActivo && (
            <button
              type="button"
              onClick={() => setCobradorFiltro("todos")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Ver todos
            </button>
          )}
          <div className="text-sm text-slate-500">{totalRegistros} registros</div>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por contrato, cliente, cobrador o zona"
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-slate-800 focus:border-sky-600 focus:outline-none"
        />
      </div>

      {contratosSalida.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-500">
          No se encontraron contratos de salida para el periodo seleccionado.
        </div>
      ) : (
        <>
          <div className="mt-4">
            <PaginacionControles
              registrosPorPagina={registrosPorPagina}
              cambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
              totalRegistros={totalRegistros}
              indiceInicio={indiceInicio}
              indiceFin={indiceFin}
              label="contratos"
            />
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_30px_rgba(14,165,233,0.08)]">
            <table className="w-full min-w-330 text-sm">
              <thead className="bg-[linear-gradient(90deg,rgba(224,242,254,0.95)_0%,rgba(240,249,255,1)_30%,rgba(236,254,255,1)_100%)] text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Promesa</th>
                  <th className="px-4 py-3 text-left font-semibold">Contrato</th>
                  <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold">Cobrador</th>
                  <th className="px-4 py-3 text-left font-semibold">Entrega</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha venta</th>
                  <th className="px-4 py-3 text-left font-semibold">Primer pago</th>
                  <th className="px-4 py-3 text-right font-semibold">Saldo</th>
                  <th className="px-4 py-3 text-left font-semibold">Accion</th>
                </tr>
              </thead>
              <tbody>
                {contratosSalidaPaginados.map((contrato) => (
                  <ContratoSalidaRow
                    key={contrato.id}
                    contrato={contrato}
                    onEditarEntrega={onEditarEntrega}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              paginaAnterior={paginaAnterior}
              paginaSiguiente={paginaSiguiente}
              irAPagina={irAPagina}
            />
          )}
        </>
      )}
    </section>
  )
}
