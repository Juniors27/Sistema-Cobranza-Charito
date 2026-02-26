"use client"

import { useRef } from "react"
import { useReporteCobranza } from "@/src/hooks/useReporteCobranza"

import PanelFiltros from "./PanelFiltros"
import TablaResultados from "./TablaResultados"
import ModalDetalle from "./ModalDetalle"

export default function FiltrosReporteCobranza() {
  const printRef = useRef(null)

  const reporte = useReporteCobranza()

  return (
    <div className="space-y-6">
      <PanelFiltros {...reporte} />

      <TablaResultados {...reporte} />

      <ModalDetalle {...reporte} printRef={printRef} />
    </div>
  )
}
