"use client"

import {
  Users,
  DollarSign,
  AlertCircle,
  MapPin,
  UserCheck,  
  XCircle,
} from "lucide-react"
import { LoadingScreen, ErrorScreen, SectionHeader } from "@/components/ui"

import { useDashboard } from "@/src/hooks/useDashboard"

export default function DashboardContent() {
  const {
    ventasActivas,
    clientesPorZona,
    clientesPorCobrador,
    totalSaldoPendiente,
    totalVentas,
    loading,
    error,
    cargarDatos,
  } = useDashboard()

  if (loading) {
    return <LoadingScreen mensaje="Cargando datos..." />
  }

  if (error) {
    return (
      <ErrorScreen
        mensaje={error}
        onRetry={cargarDatos}
      />
    )
  }

  /* =========================
     RENDER PRINCIPAL
  ========================== */
  return (
    <div className="max-w-screen-2xl mx-auto">

          <SectionHeader
            titulo="Dashboard"
            subtitulo="Resumen general del sistema (solo contratos activos con saldo pendiente)"
            onRefresh={cargarDatos}
          />                
      

      <div className="space-y-6">
        {/* TARJETAS DE MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-16 h-16 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Total Ventas</div>
                <div className="text-3xl font-bold">
                  S/ {totalVentas.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-16 h-16 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Saldo Pendiente</div>
                <div className="text-3xl font-bold">
                  S/ {totalSaldoPendiente.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-16 h-16 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Contratos Activos</div>
                <div className="text-3xl font-bold">
                  {ventasActivas.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CLIENTES POR ZONA */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-8 h-8 mr-2 text-indigo-600" />
            Clientes Activos por Zona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(clientesPorZona).map(([zona, cantidad]) => (
              <div
                key={zona}
                className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {cantidad}
                  </div>
                  <div className="text-gray-700 font-semibold mt-2 capitalize">
                    {zona}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLIENTES POR COBRADOR */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <UserCheck className="w-8 h-8 mr-2 text-indigo-600" />
            Clientes por Cobrador
          </h2>

          {clientesPorCobrador.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay cobradores registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientesPorCobrador.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-full">
                        <UserCheck className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {item.nombre}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center capitalize">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.zona}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {item.cantidad}
                      </div>
                      <div className="text-xs text-gray-500">
                        contratos activos
                      </div>
                    </div>
                  </div>

                  {item.bajadas > 0 && (
                    <div className="flex items-center justify-between bg-red-50 border-2 border-red-200 rounded-lg p-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-700">
                          Contratos Bajados
                        </span>
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        {item.bajadas}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
