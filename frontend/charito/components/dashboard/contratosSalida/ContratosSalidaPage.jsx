"use client"

import { useMemo, useState } from "react"
import { CalendarRange, ClipboardList, PackageCheck, Truck } from "lucide-react"
import { ErrorScreen, LoadingScreen, SectionHeader } from "@/components/ui"
import { useContratosSalida } from "@/src/hooks/useContratosSalida"
import TarjetaResumen from "./TarjetaResumen"
import ContratosSalidaFiltros from "./ContratosSalidaFiltros"
import ContratosSalidaGrupos from "./ContratosSalidaGrupos"
import ContratosSalidaTable from "./ContratosSalidaTable"
import ContratoSalidaEntregaModal from "./ContratoSalidaEntregaModal"
import {
  formatearRangoContratoSalida,
  obtenerEstadoEntregaContratoSalida,
} from "./contratosSalidaUtils"

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
    return `Semana laboral activa: ${formatearRangoContratoSalida(
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
      estado: obtenerEstadoEntregaContratoSalida(contrato),
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

      <ContratosSalidaFiltros
        periodo={salida.periodo}
        setPeriodo={salida.setPeriodo}
        cobradorFiltro={salida.cobradorFiltro}
        setCobradorFiltro={salida.setCobradorFiltro}
        cobradores={salida.cobradores}
        fechaInicio={salida.fechaInicio}
        setFechaInicio={salida.setFechaInicio}
        fechaFin={salida.fechaFin}
        setFechaFin={salida.setFechaFin}
        rangoSemanaLaboral={salida.rangoSemanaLaboral}
        etiquetaPeriodo={etiquetaPeriodo}
      />

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

      <ContratosSalidaGrupos
        gruposPorCobrador={salida.gruposPorCobrador}
        cobradorFiltro={salida.cobradorFiltro}
        setCobradorFiltro={salida.setCobradorFiltro}
      />

      <ContratosSalidaTable
        filtroTodosActivo={filtroTodosActivo}
        setCobradorFiltro={salida.setCobradorFiltro}
        totalRegistros={salida.totalRegistros}
        busqueda={salida.busqueda}
        setBusqueda={salida.setBusqueda}
        contratosSalida={salida.contratosSalida}
        contratosSalidaPaginados={salida.contratosSalidaPaginados}
        registrosPorPagina={salida.registrosPorPagina}
        cambiarRegistrosPorPagina={salida.cambiarRegistrosPorPagina}
        indiceInicio={salida.indiceInicio}
        indiceFin={salida.indiceFin}
        totalPaginas={salida.totalPaginas}
        paginaActual={salida.paginaActual}
        paginaAnterior={salida.paginaAnterior}
        paginaSiguiente={salida.paginaSiguiente}
        irAPagina={salida.irAPagina}
        onEditarEntrega={abrirEdicionEntrega}
      />

      <ContratoSalidaEntregaModal
        contrato={contratoEnEdicion}
        valorEntrega={valorEntrega}
        actualizarEntregaLocal={actualizarEntregaLocal}
        cerrarEdicionEntrega={cerrarEdicionEntrega}
        guardarEntrega={guardarEntrega}
        guardandoEntregaId={salida.guardandoEntregaId}
      />
    </div>
  )
}
