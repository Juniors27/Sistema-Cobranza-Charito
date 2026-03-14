"use client"

import { Plus, Trash2 } from "lucide-react"
import { productos } from "@/src/data/productos"
import { useVentas } from "@/src/hooks/useVentas"
import { SectionHeader } from "@/components/ui"

const convertirAMayusculas = (valor) => valor.toUpperCase()

const formatearMoneda = (monto) => `S/ ${Number(monto || 0).toFixed(2)}`

const VentasForm = () => {
  const {
    cobradores,
    formVenta,
    setFormVenta,
    buscarProducto,
    setBuscarProducto,
    mostrarProductos,
    setMostrarProductos,
    productosFiltrados,
    registrarVenta,
    validarContrato,
    errorContrato,
    mostrarSaldo,
    setMostrarSaldo,
    saldo,
    precioTotal,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  } = useVentas(productos)

  return (
    <div className="space-y-6">
      <SectionHeader
        titulo="Nueva Venta"
        subtitulo="Registra contratos con uno o varios productos sin perder orden en la captura"
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)] md:p-8">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">
          Registro de Nueva Venta
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Numero de Contrato *
              </label>
              <input
                type="text"
                placeholder="1234"
                value={formVenta.numeroContrato}
                onChange={(e) =>
                  setFormVenta({
                    ...formVenta,
                    numeroContrato: convertirAMayusculas(e.target.value),
                  })
                }
                onBlur={() => validarContrato(formVenta.numeroContrato)}
                className={`w-full rounded-xl border p-3 text-slate-800 focus:outline-none ${
                  errorContrato
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-sky-600"
                }`}
              />
              {errorContrato && <p className="mt-1 text-sm text-red-500">{errorContrato}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={formVenta.nombre}
                  onChange={(e) =>
                    setFormVenta({
                      ...formVenta,
                      nombre: convertirAMayusculas(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Apellido *
                </label>
                <input
                  type="text"
                  placeholder="Perez"
                  value={formVenta.apellido}
                  onChange={(e) =>
                    setFormVenta({
                      ...formVenta,
                      apellido: convertirAMayusculas(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Direccion *
              </label>
              <input
                type="text"
                placeholder="Ingrese la direccion"
                value={formVenta.direccion}
                onChange={(e) =>
                  setFormVenta({
                    ...formVenta,
                    direccion: convertirAMayusculas(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Lugar
              </label>
              <input
                type="text"
                placeholder="Ejm. San Andres, Lomas"
                value={formVenta.lugar}
                onChange={(e) =>
                  setFormVenta({
                    ...formVenta,
                    lugar: convertirAMayusculas(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Zona *
              </label>
              <select
                value={formVenta.zona}
                onChange={(e) => setFormVenta({ ...formVenta, zona: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              >
                <option value="milagro">Milagro</option>
                <option value="huanchaco">Huanchaco</option>
                <option value="buenos aires">Buenos Aires</option>
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="relative">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Agregar producto *
                </label>

                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={buscarProducto}
                  onChange={(e) => {
                    setBuscarProducto(convertirAMayusculas(e.target.value))
                    setMostrarProductos(true)
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                />

                {mostrarProductos && buscarProducto && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white text-slate-800 shadow-lg">
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((producto) => (
                        <li
                          key={producto.id}
                          onClick={() => agregarProducto(producto)}
                          className="cursor-pointer px-4 py-2 hover:bg-slate-50"
                        >
                          {producto.nombre}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-slate-400">Producto no encontrado</li>
                    )}
                  </ul>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {formVenta.productos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                    Aun no agregas productos a esta venta.
                  </div>
                ) : (
                  formVenta.productos.map((producto, index) => (
                    <div
                      key={`${producto.nombre}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-900">{producto.nombre}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {producto.categoria}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarProducto(index)}
                          className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                          aria-label={`Eliminar ${producto.nombre}`}
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
                              actualizarProducto(index, "cantidad", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Monto del producto
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={producto.precio_total}
                            onChange={(e) =>
                              actualizarProducto(
                                index,
                                "precio_total",
                                e.target.value.replace(/[^0-9.]/g, "")
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cobrador Asignado *
              </label>
              <select
                value={formVenta.cobradorId}
                onChange={(e) =>
                  setFormVenta({ ...formVenta, cobradorId: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
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

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Forma de Pago *
              </label>
              <select
                value={formVenta.frecuenciaPago}
                onChange={(e) =>
                  setFormVenta({ ...formVenta, frecuenciaPago: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              >
                <option value="semanal">Semanal (S)</option>
                <option value="quincenal">Quincenal (Q)</option>
                <option value="mensual">Mensual (M)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Dia de Cobranza
              </label>
              <input
                type="text"
                value={formVenta.diaCobro}
                onChange={(e) =>
                  setFormVenta({
                    ...formVenta,
                    diaCobro: convertirAMayusculas(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Vendedor
              </label>
              <input
                type="text"
                value={formVenta.vendedor}
                onChange={(e) =>
                  setFormVenta({
                    ...formVenta,
                    vendedor: convertirAMayusculas(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha de Venta *
              </label>
              <input
                type="date"
                value={formVenta.fechaVenta}
                onChange={(e) =>
                  setFormVenta({ ...formVenta, fechaVenta: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha estimada de primer cobro
              </label>
              <input
                type="date"
                value={formVenta.fechaPrimerCobro}
                onChange={(e) =>
                  setFormVenta({ ...formVenta, fechaPrimerCobro: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Total de productos
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {formatearMoneda(precioTotal)}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Este total se calcula sumando los montos de cada producto agregado.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Saldo Actual *
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formVenta.monto}
                onChange={(e) =>
                  setFormVenta((prev) => ({
                    ...prev,
                    monto: e.target.value.replace(/[^0-9.]/g, ""),
                  }))
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formVenta.dioInicial || false}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setFormVenta((prev) => ({
                      ...prev,
                      dioInicial: checked,
                      inicial: checked ? prev.inicial : "",
                    }))
                  }}
                  className="h-6 w-6 text-sky-600"
                />
                <span className="text-lg font-semibold text-slate-700">Dio inicial?</span>
              </label>

              {formVenta.dioInicial && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Monto Inicial
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formVenta.inicial}
                    onChange={(e) => {
                      setFormVenta((prev) => ({
                        ...prev,
                        inicial: e.target.value.replace(/[^0-9]/g, ""),
                      }))
                      setMostrarSaldo(false)
                    }}
                    onBlur={() => setMostrarSaldo(true)}
                    className="w-full rounded-xl border border-sky-300 bg-white p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
                  />

                  {mostrarSaldo && formVenta.monto && formVenta.inicial && (
                    <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                      <div className="text-sm text-slate-600">Saldo despues del inicial:</div>
                      <div className="text-xl font-bold text-emerald-600">
                        {formatearMoneda(saldo)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={registrarVenta}
              className="flex w-full items-center justify-center rounded-xl bg-sky-700 p-4 text-lg font-semibold text-white transition-colors hover:bg-sky-800"
            >
              <Plus className="mr-2 h-6 w-6" />
              Registrar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentasForm
