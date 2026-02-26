"use client"

import { useReporteCobranza } from "@/src/hooks/useReporteCobranza"

import PanelFiltros from "./PanelFiltros"
import TablaResultados from "./TablaResultados"
import ModalDetalle from "./ModalDetalle"

export default function ReporteContainer() {
    const reporte = useReporteCobranza()

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Reporte de Cobranza</h1>

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
                    data={reporte.pagosReporteFiltrados}
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
