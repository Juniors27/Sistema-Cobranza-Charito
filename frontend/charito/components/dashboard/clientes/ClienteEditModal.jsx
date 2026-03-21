"use client"

import { Plus, Trash2 } from "lucide-react"

export default function ClienteEditModal({
  ventaEditar,
  setVentaEditar,
  guardarEdicion,
  setModalEditar,
  cobradores,
  productos,
  buscarProductoEdit,
  setBuscarProductoEdit,
  mostrarProductosEdit,
  setMostrarProductosEdit,
  agregarProductoEditar,
  actualizarProductoEditar,
  eliminarProductoEditar,
}) {
  if (!ventaEditar) return null

  const totalProductos = (ventaEditar.productos || []).reduce(
    (total, producto) => total + Number(producto.precio_total || 0),
    0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-gray-800">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6">
        <h2 className="mb-6 text-2xl font-bold">Editar Cliente</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">Número de Contrato</label>
            <input
              type="text"
              value={ventaEditar.numero_contrato}
              disabled
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Fecha de Venta</label>
            <input
              type="date"
              value={ventaEditar.fecha_venta ? ventaEditar.fecha_venta.split("T")[0] : ""}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  fecha_venta: e.target.value,
                })
              }
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Nombre</label>
            <input
              type="text"
              value={ventaEditar.nombre}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  nombre: e.target.value,
                })
              }
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Apellido</label>
            <input
              type="text"
              value={ventaEditar.apellido}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  apellido: e.target.value,
                })
              }
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Dirección</label>
            <input
              type="text"
              value={ventaEditar.direccion}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  direccion: e.target.value,
                })
              }
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Zona</label>
            <select
              value={ventaEditar.zona}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  zona: e.target.value,
                })
              }
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            >
              <option value="milagro">Milagro</option>
              <option value="huanchaco">Huanchaco</option>
              <option value="buenos aires">Buenos Aires</option>
            </select>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold">Productos de la venta</label>

            <div className="relative">
              <input
                type="text"
                value={buscarProductoEdit}
                onChange={(e) => {
                  setBuscarProductoEdit(e.target.value)
                  setMostrarProductosEdit(true)
                }}
                className="w-full rounded-xl border-2 border-gray-200 p-3"
                placeholder="Buscar producto..."
              />

              {mostrarProductosEdit && (
                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border bg-white shadow-lg">
                  {productos
                    .filter((producto) =>
                      producto.nombre.toLowerCase().includes(buscarProductoEdit.toLowerCase())
                    )
                    .map((producto) => (
                      <div
                        key={producto.id}
                        onClick={() => agregarProductoEditar(producto)}
                        className="cursor-pointer p-3 hover:bg-sky-50"
                      >
                        {producto.nombre}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {(ventaEditar.productos || []).map((producto, index) => (
                <div
                  key={`${producto.nombre}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900">{producto.nombre}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {producto.categoria || "otros"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarProductoEditar(index)}
                      className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={producto.cantidad}
                        onChange={(e) =>
                          actualizarProductoEditar(index, "cantidad", e.target.value)
                        }
                        className="w-full rounded-xl border-2 border-gray-200 p-3"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Monto del producto
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={producto.precio_total}
                        onChange={(e) =>
                          actualizarProductoEditar(index, "precio_total", e.target.value)
                        }
                        className="w-full rounded-xl border-2 border-gray-200 p-3"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
                Total de productos: <span className="font-semibold text-slate-900">S/ {totalProductos.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Saldo Actual *</label>
            <input
              type="number"
              step="0.01"
              value={ventaEditar.monto}
              onChange={(e) => setVentaEditar({ ...ventaEditar, monto: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Forma de Pago *</label>
            <select
              value={ventaEditar.frecuencia_pago}
              onChange={(e) => setVentaEditar({ ...ventaEditar, frecuencia_pago: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            >
              <option value="semanal">Semanal (S)</option>
              <option value="quincenal">Quincenal (Q)</option>
              <option value="mensual">Mensual (M)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Monto segun frecuencia
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={ventaEditar.monto_frecuencia ?? ""}
              onChange={(e) =>
                setVentaEditar({ ...ventaEditar, monto_frecuencia: e.target.value })
              }
              className="w-full rounded-xl border-2 border-gray-200 p-3"
              placeholder="Ej. 20, 40, 60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Día de Cobranza</label>
            <input
              type="text"
              value={ventaEditar.dia_cobro || ""}
              onChange={(e) => setVentaEditar({ ...ventaEditar, dia_cobro: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Vendedor</label>
            <input
              type="text"
              value={ventaEditar.vendedor || ""}
              onChange={(e) => setVentaEditar({ ...ventaEditar, vendedor: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Cobrador Asignado *</label>
            <select
              value={ventaEditar.cobrador || ""}
              onChange={(e) => setVentaEditar({ ...ventaEditar, cobrador: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 p-3"
            >
              <option value="">Seleccionar cobrador</option>
              {cobradores.map((cobrador) => (
                <option key={cobrador.id} value={cobrador.id}>
                  {cobrador.nombre} - {cobrador.zona}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={guardarEdicion}
            className="flex-1 rounded-xl bg-sky-700 p-3 font-semibold text-white hover:bg-sky-800"
          >
            Guardar Cambios
          </button>

          <button
            onClick={() => setModalEditar(false)}
            className="flex-1 rounded-xl bg-gray-300 p-3 font-semibold text-gray-700 hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
