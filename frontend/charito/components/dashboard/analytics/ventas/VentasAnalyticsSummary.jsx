import { HandCoins, Package2, ReceiptText } from "lucide-react"
import { formatearMoneda } from "@/src/utils/ventasAnalyticsUtils"

const INDICATOR_CARDS = [
  {
    key: "totalVentas",
    label: "Ventas del periodo",
    color: "sky",
    icon: ReceiptText,
  },
  {
    key: "totalMonto",
    label: "Monto vendido",
    color: "emerald",
    icon: HandCoins,
    money: true,
  },
  {
    key: "totalInicial",
    label: "Iniciales registradas",
    color: "amber",
    icon: HandCoins,
    money: true,
  },
  {
    key: "totalUnidades",
    label: "Unidades vendidas",
    color: "violet",
    icon: Package2,
  },
]

const COLOR_CLASSES = {
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
}

export default function VentasAnalyticsSummary({
  totalVentas,
  totalMonto,
  totalUnidades,
  totalInicial,
}) {
  const values = {
    totalVentas,
    totalMonto,
    totalInicial,
    totalUnidades,
  }

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {INDICATOR_CARDS.map((card) => {
        const Icon = card.icon
        const value = values[card.key]

        return (
          <article
            key={card.key}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {card.label}
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                  {card.money ? formatearMoneda(value) : value}
                </div>
              </div>
              <div className={`rounded-2xl border p-3 ${COLOR_CLASSES[card.color]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
