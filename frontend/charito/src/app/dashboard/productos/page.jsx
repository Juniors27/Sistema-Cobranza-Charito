"use client"

import { useAnalyticsProductos } from "@/src/hooks/useAnalyticsProductos"
import ProductosFilter from "@/components/dashboard/analytics/productos/ProductosFilter"
import ProductosTable from "@/components/dashboard/analytics/productos/ProductosTable"

export default function AnalyticsProductosVendidos() {
  const analytics = useAnalyticsProductos()

  return (
    <div className="space-y-6">
      <ProductosFilter {...analytics} />
      <ProductosTable {...analytics} />
    </div>
  )
}

