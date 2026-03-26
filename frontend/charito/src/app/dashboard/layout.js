"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  ClipboardList,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Receipt,
  Package,
  HandCoins,
  Building2,
} from "lucide-react"

export default function DashboardLayout({ children }) {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
    { name: "Contratos de salida", href: "/dashboard/contratos-salida", icon: ClipboardList },
    { name: "Nueva Venta", href: "/dashboard/ventas", icon: FileText },
    { name: "Reporte Ventas", href: "/dashboard/reporte-ventas", icon: BarChart3 },
    { name: "Pagos", href: "/dashboard/pagos", icon: CheckCircle2 },
    { name: "Cobradores", href: "/dashboard/cobradores", icon: HandCoins },
    { name: "Control tarjetas", href: "/dashboard/historial", icon: Clock },
    { name: "Cobranza", href: "/dashboard/cobranza", icon: Receipt },
    { name: "Productos", href: "/dashboard/productos", icon: Package },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(226,232,240,0.9),_rgba(241,245,249,1)_32%,_rgba(248,250,252,1)_100%)] px-4 py-6 md:px-6">
      <div className="max-w-screen-2xl mx-auto mb-6">
        <div className="rounded-[30px] border border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="px-6 py-7 md:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                <Building2 className="h-4 w-4 text-sky-700" />
                Plataforma Administrativa
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Comercial &quot;CHARITO&quot;
              </h1>
              <p className="mt-2 text-base font-medium tracking-[0.08em] text-slate-500 uppercase">
                Sistema de gestion de cobranza
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto mb-8">
        <div className="rounded-[30px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Modulos del Sistema
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                Acceso rapido a operaciones
              </div>
            </div>
            <div className="hidden md:block text-sm text-slate-500">
              {menuItems.length} modulos disponibles
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-10">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || (pathname === "/dashboard" && item.href === "/dashboard")

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex min-h-[118px] flex-col justify-between rounded-2xl border px-4 py-4 transition-all duration-200 ${
                    isActive
                      ? "border-sky-700 bg-linear-to-br from-sky-700 to-slate-900 text-white shadow-lg shadow-sky-900/20"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      isActive ? "bg-white/10" : "bg-white border border-slate-200"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-sky-700"}`} />
                  </div>

                  <div className="mt-4">
                    <div className={`text-sm font-semibold leading-snug ${isActive ? "text-white" : "text-slate-900"}`}>
                      {item.name}
                    </div>
                    <div className={`mt-2 text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                      {isActive ? "Modulo actual" : "Abrir modulo"}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto">{children}</div>
    </div>
  )
}
