"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  CalendarRange,
  ClipboardList,
  FilePenLine,
  PackageCheck,
  Search,
  Sparkles,
  Truck,
  X,
} from "lucide-react"
import {
  ErrorScreen,
  LoadingScreen,
  Paginacion,
  PaginacionControles,
  SectionHeader,
} from "@/components/ui"
import { useContratosSalida } from "@/src/hooks/useContratosSalida"

const periodos = [
  { id: "semana_laboral", label: "Semana Laboral" },
  { id: "historico", label: "Historico" },
  { id: "rango", label: "Rango" },
]

const formatearFecha = (fecha) => {
  if (!fecha) return "No definida"

  if (fecha instanceof Date) {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, "0")
    const day = String(fecha.getDate()).padStart(2, "0")
    return `${day}/${month}/${year}`
  }

  const [year, month, day] = String(fecha).slice(0, 10).split("-")
  if (!year || !month || !day) return String(fecha)

  return `${day}/${month}/${year}`
}

const formatearMonto = (monto) => `S/ ${Number(monto || 0).toFixed(2)}`

const formatearRango = (inicio, fin) => `${formatearFecha(inicio)} al ${formatearFecha(fin)}`

function TarjetaResumen({ titulo, valor, detalle, icono: Icono, tono = "sky" }) {
  const estilos = {
    sky: "border-sky-200 bg-linear-to-br from-sky-50 via-white to-cyan-50 text-sky-900",
    emerald:
      "border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-lime-50 text-emerald-900",
    amber:
      "border-amber-200 bg-linear-to-br from-amber-50 via-white to-orange-50 text-amber-900",
    slate: "border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900",
  }

  return (
    <article
      className={`rounded-3xl border p-4 shadow-[0_12px_26px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.1)] ${estilos[tono]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
            {titulo}
          </div>
          <div className="mt-2 text-3xl font-semibold">{valor}</div>
          <div className="mt-1 text-xs opacity-80">{detalle}</div>
        </div>
        <div className="rounded-2xl bg-white/70 p-2.5">
          <Icono className="h-5 w-5" />
        </div>
      </div>
    </article>
  )
}

const obtenerEstadoEntrega = (contrato) => {
  if (contrato.entregado_cobrador) return "entregado"
  if (contrato.fecha_entrega_cobrador) return "programado"
  return "pendiente"
}

export default function ContratosSalidaPage() {
  const salida = useContratosSalida()
  const [entregaForm, setEntregaForm] = useState({})
  const [contratoEnEdicion, setContratoEnEdicion] = useState(null)
  const filtroTodosActivo = salida.cobradorFiltro === "todos"

  const etiquetaPeriodo = useMemo(() => {
    if (salida.periodo === "historico") return "Historial completo de contratos entregados"
    if (salida.periodo === "rango" && salida.fechaInicio && salida.fechaFin) {
      return `Contratos cuyo primer cobro prometido cae entre ${salida.fechaInicio} y ${salida.fechaFin}`
    }
    return `Semana laboral activa: ${formatearRango(
      salida.rangoSemanaLaboral.inicio,
      salida.rangoSemanaLaboral.fin
    )}`
  }, [salida.periodo, salida.fechaInicio, salida.fechaFin, salida.rangoSemanaLaboral])

  if (salida.loading) {
    return <LoadingScreen mensaje="Cargando contratos de salida..." />
  }

  if (salida.error) {
    return <ErrorScreen mensaje={salida.error} onRetry={() => salida.cargarDatos()} />
  }

  const valorEntrega = (contrato) =>
    entregaForm[contrato.id] || {
      estado: obtenerEstadoEntrega(contrato),
      fecha: contrato.fecha_entrega_cobrador || "",
    }

  const actualizarEntregaLocal = (contrato, cambios) => {
    const actual = valorEntrega(contrato)
    setEntregaForm((prev) => ({
      ...prev,
      [contrato.id]: {
        ...actual,
        ...cambios,
      },
    }))
  }

  const abrirEdicionEntrega = (contrato) => {
    actualizarEntregaLocal(contrato, {})
    setContratoEnEdicion(contrato)
  }

  const cerrarEdicionEntrega = () => {
    setContratoEnEdicion(null)
  }

  const guardarEntrega = async (contrato) => {
    const form = valorEntrega(contrato)
    const payload =
      form.estado === "pendiente"
        ? {
            entregado_cobrador: false,
            fecha_entrega_cobrador: "",
          }
        : {
            entregado_cobrador: form.estado === "entregado",
            fecha_entrega_cobrador: form.fecha || "",
          }

    const guardado = await salida.actualizarEntregaContrato(contrato.id, payload)

    if (guardado) {
      setEntregaForm((prev) => {
        const siguiente = { ...prev }
        delete siguiente[contrato.id]
        return siguiente
      })
      cerrarEdicionEntrega()
    }
  }

  return (
    <div>
      <SectionHeader
        titulo="Contratos de Salida"
        subtitulo="Consulta que contratos fueron entregados a cada cobrador y revisa si ya registraron su primer pago."
        onRefresh={() => salida.cargarDatos(true)}
      />

      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_32%),linear-gradient(135deg,#f8fafc_0%,#ffffff_40%,#ecfeff_100%)] px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Sparkles className="h-4 w-4" />
                Flujo de salida
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Semana operativa de contratos
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-600">
                El filtro de semana laboral toma como referencia la fecha prometida del primer pago.
                De domingo a viernes mantiene visible la semana operativa actual y el sábado te prepara
                la siguiente salida de domingo a miércoles.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <CalendarRange className="h-4 w-4 text-sky-700" />
                  {salida.periodo === "historico"
                    ? "Promesas registradas"
                    : salida.periodo === "rango"
                      ? "Rango seleccionado"
                      : "Semana laboral"}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {salida.periodo === "historico"
                    ? "Todas las fechas de promesa de pago"
                    : salida.periodo === "rango" && salida.fechaInicio && salida.fechaFin
                      ? formatearRango(salida.fechaInicio, salida.fechaFin)
                      : formatearRango(salida.rangoSemanaLaboral.inicio, salida.rangoSemanaLaboral.fin)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-slate-950 px-4 py-3 text-white shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Logica activa
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-100">
                  {salida.periodo === "historico"
                    ? "Vista completa de promesas"
                    : salida.periodo === "rango"
                      ? "Consulta personalizada"
                      : "Domingo-Miercoles"}
                  {salida.periodo === "semana_laboral" && (
                    <>
                      <ArrowRight className="h-4 w-4 text-sky-300" />
                      seguimiento operativo
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Filtros de seguimiento
              </div>
              <p className="mt-2 text-sm text-slate-600">{etiquetaPeriodo}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Periodo</label>
                <select
                  value={salida.periodo}
                  onChange={(e) => salida.setPeriodo(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                >
                  {periodos.map((periodo) => (
                    <option key={periodo.id} value={periodo.id}>
                      {periodo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Cobrador</label>
                <select
                  value={salida.cobradorFiltro}
                  onChange={(e) => salida.setCobradorFiltro(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                >
                  <option value="todos">Todos los cobradores</option>
                  {salida.cobradores.map((cobrador) => (
                    <option key={cobrador.id} value={String(cobrador.id)}>
                      {cobrador.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Fecha inicio</label>
                <input
                  type="date"
                  value={salida.fechaInicio}
                  onChange={(e) => salida.setFechaInicio(e.target.value)}
                  disabled={salida.periodo !== "rango"}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Fecha fin</label>
                <input
                  type="date"
                  value={salida.fechaFin}
                  onChange={(e) => salida.setFechaFin(e.target.value)}
                  disabled={salida.periodo !== "rango"}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          titulo="Promesas registradas"
          valor={salida.resumen.total}
          detalle="Total del periodo filtrado"
          icono={Truck}
          tono="sky"
        />
        <TarjetaResumen
          titulo="Entregados"
          valor={salida.resumen.entregados}
          detalle="Ya salieron al cobrador"
          icono={CalendarRange}
          tono="slate"
        />
        <TarjetaResumen
          titulo="Con primer pago"
          valor={salida.resumen.yaPagaron}
          detalle="Ya registraron su primer abono"
          icono={PackageCheck}
          tono="emerald"
        />
        <TarjetaResumen
          titulo="Pendientes"
          valor={salida.resumen.pendientesPrimerPago}
          detalle="Aun no registran primer pago"
          icono={ClipboardList}
          tono="amber"
        />
      </section>

      <section className="mt-4 rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,250,252,1)_100%)] p-5 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Resumen por cobrador
            </div>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Salidas agrupadas
            </h2>
          </div>
          <div className="text-sm text-slate-500">
            {salida.gruposPorCobrador.length} cobradores con contratos en el filtro actual
          </div>
        </div>

        {salida.gruposPorCobrador.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-500">
            No hay contratos de salida para los filtros seleccionados.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {salida.gruposPorCobrador.map((grupo) => (
              <button
                key={grupo.id}
                type="button"
                onClick={() => salida.setCobradorFiltro(String(grupo.id))}
                className={`rounded-3xl border bg-linear-to-br p-4 text-left shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(15,23,42,0.1)] ${
                  salida.cobradorFiltro === String(grupo.id)
                    ? "border-sky-400 from-sky-100 via-cyan-50 to-white ring-2 ring-sky-200"
                    : "border-slate-200 from-white via-slate-50 to-sky-50"
                }`}
                aria-pressed={salida.cobradorFiltro === String(grupo.id)}
                title={`Filtrar tabla por ${grupo.nombre}`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Cobrador
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{grupo.nombre}</h3>
                    <p className="mt-1 capitalize text-sm text-slate-500">{grupo.zona}</p>
                  </div>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {salida.cobradorFiltro === String(grupo.id) ? "Activo" : "Filtrar"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-sky-50 px-3 py-3 text-sky-800">
                    <div className="text-lg font-semibold">{grupo.total}</div>
                    <div>Total</div>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-3 text-slate-800">
                    <div className="text-lg font-semibold">{grupo.entregados}</div>
                    <div>Entregados</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-3 text-emerald-800">
                    <div className="text-lg font-semibold">{grupo.yaPagaron}</div>
                    <div>Pagaron</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-3 py-3 text-amber-800 col-span-3">
                    <div className="text-lg font-semibold">{grupo.pendientes}</div>
                    <div>Pendientes</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

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
                onClick={() => salida.setCobradorFiltro("todos")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Ver todos
              </button>
            )}
            <div className="text-sm text-slate-500">{salida.totalRegistros} registros</div>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={salida.busqueda}
            onChange={(e) => salida.setBusqueda(e.target.value)}
            placeholder="Buscar por contrato, cliente, cobrador o zona"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-slate-800 focus:border-sky-600 focus:outline-none"
          />
        </div>

        {salida.contratosSalida.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-500">
            No se encontraron contratos de salida para el periodo seleccionado.
          </div>
        ) : (
          <>
            <div className="mt-4">
              <PaginacionControles
                registrosPorPagina={salida.registrosPorPagina}
                cambiarRegistrosPorPagina={salida.cambiarRegistrosPorPagina}
                totalRegistros={salida.totalRegistros}
                indiceInicio={salida.indiceInicio}
                indiceFin={salida.indiceFin}
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
                  {salida.contratosSalidaPaginados.map((contrato) => (
                    <tr
                      key={contrato.id}
                      className="border-t border-slate-100 transition-colors odd:bg-white even:bg-sky-50/30 hover:bg-cyan-50/70"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {formatearFecha(contrato.fecha_primer_cobro)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {contrato.numero_contrato}
                      </td>
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
                              ? formatearFecha(contrato.fecha_entrega_cobrador)
                              : "Sin fecha"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatearFecha(contrato.fecha_venta)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            contrato.primer_pago_registrado
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {contrato.primer_pago_registrado
                            ? formatearFecha(contrato.fecha_primer_pago)
                            : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-rose-700">
                        {formatearMonto(contrato.saldo_pendiente)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => abrirEdicionEntrega(contrato)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 transition-colors hover:bg-sky-100"
                          aria-label={`Editar contrato ${contrato.numero_contrato}`}
                          title="Editar contrato"
                        >
                          <FilePenLine className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {salida.totalPaginas > 1 && (
              <Paginacion
                paginaActual={salida.paginaActual}
                totalPaginas={salida.totalPaginas}
                paginaAnterior={salida.paginaAnterior}
                paginaSiguiente={salida.paginaSiguiente}
                irAPagina={salida.irAPagina}
              />
            )}
          </>
        )}
      </section>

      {contratoEnEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                  Gestion de entrega
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {contratoEnEdicion.numero_contrato}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{contratoEnEdicion.cliente}</p>
              </div>

              <button
                onClick={cerrarEdicionEntrega}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
                aria-label="Cerrar edicion de entrega"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <div>
                  Promesa de pago:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatearFecha(contratoEnEdicion.fecha_primer_cobro)}
                  </span>
                </div>
                <div className="mt-1">
                  Entrega actual:{" "}
                  <span className="font-semibold text-slate-900">
                    {contratoEnEdicion.entregado_cobrador
                      ? `Entregado${contratoEnEdicion.fecha_entrega_cobrador ? ` (${formatearFecha(contratoEnEdicion.fecha_entrega_cobrador)})` : ""}`
                      : contratoEnEdicion.fecha_entrega_cobrador
                        ? `Programado (${formatearFecha(contratoEnEdicion.fecha_entrega_cobrador)})`
                        : "Pendiente de entrega"}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Estado</label>
                <select
                  value={valorEntrega(contratoEnEdicion).estado}
                  onChange={(e) =>
                    actualizarEntregaLocal(contratoEnEdicion, { estado: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="programado">Programado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha de entrega
                </label>
                <input
                  type="date"
                  value={valorEntrega(contratoEnEdicion).fecha}
                  onChange={(e) =>
                    actualizarEntregaLocal(contratoEnEdicion, { fecha: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cerrarEdicionEntrega}
                  className="flex-1 rounded-2xl bg-slate-200 px-4 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => guardarEntrega(contratoEnEdicion)}
                  disabled={salida.guardandoEntregaId === contratoEnEdicion.id}
                  className="flex-1 rounded-2xl bg-sky-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salida.guardandoEntregaId === contratoEnEdicion.id
                    ? "Guardando..."
                    : "Guardar entrega"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
