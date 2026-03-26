"use client"

import { useState } from "react"
import {
  CalendarDays,
  Download,
  Filter,
  Flame,
  MapPin,
  ShieldAlert,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"
import { LoadingScreen, ErrorScreen, SectionHeader } from "@/components/ui"
import { useDashboard } from "@/src/hooks/useDashboard"
import { exportarClientesCriticosExcel } from "@/src/utils/dashboardUtils"
import { toast } from "sonner"

const periodos = [
  { id: "semana_laboral", label: "Semana Laboral" },
  { id: "hoy", label: "Hoy" },
  { id: "historico", label: "Historico" },
  { id: "rango", label: "Rango" },
]

const formatearFecha = (fecha) => {
  if (!fecha) return "No definida"

  const [year, month, day] = String(fecha).split("-")
  if (!year || !month || !day) return fecha

  return `${day}/${month}/${year}`
}

function PanelClientesCriticos({ resumenClientesCriticos }) {
  const { total, saldoTotal, cobradoresComprometidos, top, lista } = resumenClientesCriticos
  const [mostrarTodos, setMostrarTodos] = useState(false)

  const clientesVisibles = mostrarTodos ? lista : top

  const exportarExcel = () => {
    const exportado = exportarClientesCriticosExcel(lista)
    if (exportado) {
      toast.success("Excel de clientes criticos exportado")
    } else {
      toast.error("No hay clientes criticos para exportar")
    }
  }

  return (
    <section className="rounded-[28px] border border-rose-200 bg-linear-to-br from-white to-rose-50 p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 md:text-2xl">
            <ShieldAlert className="h-7 w-7 text-rose-700" />
            Clientes criticos
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Contratos con atraso severo segun su frecuencia real de pago. Este bloque muestra los casos mas delicados para seguimiento inmediato.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMostrarTodos((prev) => !prev)}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
          >
            {mostrarTodos ? "Ver top 5" : `Ver todos (${total})`}
          </button>
          <button
            onClick={exportarExcel}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-rose-200 bg-white px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            Casos criticos
          </div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{total}</div>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-white px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
            Saldo expuesto
          </div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            S/ {saldoTotal.toFixed(2)}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cobradores comprometidos
          </div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {cobradoresComprometidos}
          </div>
        </article>
      </div>

      {lista.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-10 text-center text-slate-500">
          No hay clientes criticos segun los umbrales actuales del modelo.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-rose-100 bg-white">
          <table className="w-full min-w-230 text-sm">
            <thead className="bg-rose-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Contrato</th>
                <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold">Cobrador</th>
                <th className="px-4 py-3 text-left font-semibold">Frecuencia</th>
                <th className="px-4 py-3 text-left font-semibold">Ultimo movimiento</th>
                <th className="px-4 py-3 text-left font-semibold">Atraso</th>
                <th className="px-4 py-3 text-right font-semibold">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {clientesVisibles.map((cliente, index) => (
                <tr key={cliente.id} className="border-t border-rose-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{cliente.numero_contrato}</div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700">
                      <Flame className="h-3.5 w-3.5" />
                      #{(mostrarTodos ? lista : top).findIndex((item) => item.id === cliente.id) + 1} prioridad
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium text-slate-900">{cliente.cliente}</div>
                    <div className="text-xs capitalize text-slate-500">
                      {cliente.zona} · {cliente.direccion || "Sin direccion"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{cliente.cobrador_nombre || "Sin asignar"}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{cliente.frecuencia_pago}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {cliente.fecha_ultimo_movimiento
                      ? formatearFecha(cliente.fecha_ultimo_movimiento)
                      : "Sin pagos"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-rose-700">{cliente.atraso_texto}</div>
                    <div className="text-xs text-slate-500">{cliente.dias_atraso} dias acumulados</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    S/ {cliente.saldo_pendiente.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function DashboardContent() {
  const {
    ventasActivas,
    clientesPorZona,
    clientesPorCobrador,
    canceladasPorCobrador,
    resumenClientesCriticos,
    periodo,
    setPeriodo,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    etiquetaPeriodo,
    loading,
    error,
    cargarDatos,
  } = useDashboard()

  if (loading) {
    return <LoadingScreen mensaje="Cargando datos..." />
  }

  if (error) {
    return <ErrorScreen mensaje={error} onRetry={cargarDatos} />
  }

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <SectionHeader
        titulo="Dashboard"
        subtitulo="Panel administrativo para seguimiento operativo general y control comercial"
        onRefresh={cargarDatos}
      />

      <section className="rounded-[28px] border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-6 md:p-8 text-slate-50 shadow-xl shadow-slate-300/30">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs tracking-[0.2em] uppercase text-slate-300">
              <CalendarDays className="h-4 w-4" />
              Control Administrativo
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              Resumen ejecutivo por periodo de trabajo
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-300">
              {etiquetaPeriodo}. La cartera activa se muestra de forma general y las canceladas se calculan por su ultimo pago para mantener una lectura ejecutiva del negocio.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4 md:p-5 min-w-full xl:min-w-107.5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-4">
              <Filter className="h-4 w-4" />
              Filtros del dashboard
            </div>

            <div className="flex flex-wrap gap-2">
              {periodos.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPeriodo(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    periodo === item.id
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {periodo === "rango" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <label className="text-sm text-slate-300">
                  <span className="block mb-2">Fecha inicio</span>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  <span className="block mb-2">Fecha fin</span>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Contratos Activos
              </p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">
                {ventasActivas.length}
              </p>
            </div>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Users className="h-7 w-7" />
            </div>
          </div>
        </article>

        {canceladasPorCobrador.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-rose-200 bg-linear-to-br from-white to-rose-50 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                  Canceladas
                </p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">
                  {item.cantidad}
                </p>
              </div>
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <XCircle className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-5 border-t border-rose-100 pt-4">
              <div className="font-semibold text-slate-800">{item.nombre}</div>
              <div className="text-sm capitalize text-slate-500">{item.zona}</div>
            </div>
          </article>
        ))}
      </div>

      <PanelClientesCriticos resumenClientesCriticos={resumenClientesCriticos} />

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-5 flex items-center">
          <MapPin className="w-7 h-7 mr-3 text-sky-700" />
          Clientes Activos por Zona
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(clientesPorZona).map(([zona, cantidad]) => (
            <div
              key={zona}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6"
            >
              <div className="text-4xl font-semibold text-slate-900">{cantidad}</div>
              <div className="mt-2 text-sm font-medium capitalize text-slate-500">
                {zona}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-5 flex items-center">
          <UserCheck className="w-7 h-7 mr-3 text-sky-700" />
          Clientes por Cobrador
        </h2>

        {clientesPorCobrador.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay cobradores registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {clientesPorCobrador.map((item, index) => (
              <article
                key={index}
                className="rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{item.nombre}</div>
                      <div className="text-sm text-slate-500 flex items-center capitalize">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.zona}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-semibold text-slate-900">
                      {item.cantidad}
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      activos
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-rose-600">
                      Cancelados
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-rose-700">
                      {item.canceladas}
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-red-600">
                      Bajados
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-red-700">
                      {item.bajadas}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
