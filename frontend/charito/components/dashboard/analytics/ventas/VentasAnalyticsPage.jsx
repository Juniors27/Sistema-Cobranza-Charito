"use client"

import { toast } from "sonner"
import { ErrorScreen, LoadingScreen, SectionHeader } from "@/components/ui"
import { useVentasAnalytics } from "@/src/hooks/useVentasAnalytics"
import VentasAnalyticsFilter from "@/components/dashboard/analytics/ventas/VentasAnalyticsFilter"
import VentasAnalyticsSummary from "@/components/dashboard/analytics/ventas/VentasAnalyticsSummary"
import VentasAnalyticsTable from "@/components/dashboard/analytics/ventas/VentasAnalyticsTable"
import {
  exportarVentasReporteExcel,
  imprimirVentasReporte,
} from "@/src/utils/ventasAnalyticsUtils"

export default function VentasAnalyticsPage() {
  const analytics = useVentasAnalytics()

  const exportarExcel = () => {
    const exportado = exportarVentasReporteExcel({
      ventas: analytics.ventasFiltradas,
      ventasPorFecha: analytics.ventasPorFecha,
      resumen: analytics,
      filterType: analytics.filterType,
      mesSeleccionado: analytics.mesSeleccionado,
      fechaSeleccionada: analytics.fechaSeleccionada,
      fechaInicio: analytics.fechaInicio,
      fechaFin: analytics.fechaFin,
      cobradorSeleccionado:
        analytics.cobradoresDisponibles.find(
          (item) => item.value === analytics.cobradorSeleccionado
        )?.label || "",
    })

    if (exportado) {
      toast.success("Reporte de ventas exportado a Excel")
    } else {
      toast.error("No hay ventas para exportar")
    }
  }

  const exportarPdf = () => {
    const exportado = imprimirVentasReporte({
      ventas: analytics.ventasFiltradas,
      ventasPorFecha: analytics.ventasPorFecha,
      resumen: analytics,
      descripcionPeriodo: analytics.descripcionPeriodo,
    })

    if (exportado) {
      toast.success("Vista lista para guardar como PDF")
    } else {
      toast.error("No se pudo generar la vista PDF")
    }
  }

  if (analytics.loading) {
    return <LoadingScreen mensaje="Cargando reporte de ventas..." />
  }

  if (analytics.error && !analytics.filtroAplicado) {
    return (
      <ErrorScreen
        mensaje={analytics.error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        titulo="Reporte de Ventas"
        subtitulo="Consulta cuántas ventas se hicieron por mes, fecha o rango y revisa indicadores operativos del periodo."
      />

      <VentasAnalyticsFilter
        {...analytics}
        exportarExcel={exportarExcel}
        exportarPdf={exportarPdf}
      />
      <VentasAnalyticsSummary {...analytics} />
      <VentasAnalyticsTable {...analytics} />
    </div>
  )
}
