"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { TrendingUp, Users, FileText, CheckCircle2, Clock, Receipt, Package, HandCoins} from "lucide-react"

export default function DashboardLayout({ children }) {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
    { name: "Nueva Venta", href: "/dashboard/ventas", icon: FileText },
    { name: "Pagos", href: "/dashboard/pagos", icon: CheckCircle2 },
    { name: "Cobradores", href: "/dashboard/cobradores", icon: HandCoins },
    { name: "Control tarjetas", href: "/dashboard/historial", icon: Clock },
    { name: "Cobranza", href: "/dashboard/cobranza", icon: Receipt },
    { name: "Productos", href: "/dashboard/productos", icon: Package },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-screen-2xl mx-auto mb-6">
        <div className="bg-white rounded-3xl shadow-md p-8">
          <h1 className="text-4xl font-bold text-indigo-900">Comercial "CHARITO"</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión de Cobranza v1.1</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="max-w-screen-2xl mx-auto mb-8">
        <div className="bg-blue-900 rounded-3xl shadow-md p-8">
          <div className="flex gap-4 flex-wrap justify-center">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (pathname === "/dashboard" && item.href === "/dashboard")

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center gap-2 
                    px-10 py-8 rounded-2xl transition-all duration-200
                    min-w-fit
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                        : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                    }
                  `}
                >
                  <item.icon className="w-8 h-8" />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto ">{children}</div>
    </div>
  )
}
