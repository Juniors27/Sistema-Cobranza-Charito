"use client"

import { SectionHeader } from "@/components/ui"
import { useReporteCobranza } from "@/src/hooks/useReporteCobranza"

import PanelFiltros from "./PanelFiltros"
import TablaResultados from "./TablaResultados"
import ModalDetalle from "./ModalDetalle"

export default function ReporteContainer() {
  const reporte = useReporteCobranza()

  return (
    <div className="space-y-6">
      <SectionHeader
        titulo="Reporte de Cobranza"
        subtitulo="Consulta pagos por fecha, cobrador y seguimiento detallado de contratos"
      />

      <PanelFiltros
        tipoFecha={reporte.tipoFecha}
        setTipoFecha={reporte.setTipoFecha}
        filtros={reporte.filtros}
        handleFiltroChange={reporte.handleFiltroChange}
        aplicarFiltros={reporte.aplicarFiltros}
        limpiarFiltros={reporte.limpiarFiltros}
        cobradores={reporte.cobradores}
      />

      {reporte.filtrosAplicados && (
        <TablaResultados
          data={reporte.pagosReporteVisibles}
          searchTerm={reporte.searchTerm}
          setSearchTerm={reporte.setSearchTerm}
          abrirModal={reporte.abrirModal}
        />
      )}

      {reporte.modalAbierto && reporte.pagoSeleccionado && (
        <ModalDetalle
          modalAbierto={reporte.modalAbierto}
          cerrarModal={reporte.cerrarModal}
          pagoSeleccionado={reporte.pagoSeleccionado}
          historialPagos={reporte.historialPagos}
          cargandoHistorial={reporte.cargandoHistorial}
        />
      )}
    </div>
  )
}
