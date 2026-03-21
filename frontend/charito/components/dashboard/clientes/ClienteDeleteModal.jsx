export default function ClienteDeleteModal({
  abierto,
  venta,
  eliminando,
  confirmarEliminacion,
  cancelarEliminacion,
}) {
  if (!abierto || !venta) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-2xl font-semibold text-slate-900">Eliminar cliente</h3>
        <p className="mt-3 text-sm text-slate-600">
          Esta acción eliminará el contrato y los pagos asociados a este cliente.
        </p>

        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
          <div className="text-sm font-semibold text-slate-900">
            {venta.numero_contrato} - {venta.nombre} {venta.apellido}
          </div>
          <div className="mt-1 text-sm text-slate-600">{venta.direccion}</div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={cancelarEliminacion}
            disabled={eliminando}
            className="flex-1 rounded-xl bg-slate-200 p-3 font-semibold text-slate-800 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarEliminacion}
            disabled={eliminando}
            className="flex-1 rounded-xl bg-rose-600 p-3 font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}
