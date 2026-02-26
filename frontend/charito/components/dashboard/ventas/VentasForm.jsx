"use client"

import { DollarSign, Plus } from "lucide-react"
import { productos } from "@/src/data/productos"
import { useVentas } from "@/src/hooks/useVentas"

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
  } = useVentas(productos)

  

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Nueva Venta</h1>
          <p className="text-gray-600">Registra un nuevo contrato de venta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            
            Registro de Nueva Venta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Contrato *
                </label>
                <input
                  type="text"
                  placeholder="1234"
                  value={formVenta.numeroContrato}
                  onChange={(e) => {
                    setFormVenta({ ...formVenta, numeroContrato: e.target.value })
                  }}
                  onBlur={()=> validarContrato(formVenta.numeroContrato)}
                  className={`w-full p-3 border-2 rounded-xl focus:outline-none text-gray-800 ${
                    errorContrato
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500"
                  }`}
                />
                {errorContrato && <p className="text-red-500 text-sm mt-1">{errorContrato}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={formVenta.nombre}
                    onChange={(e) =>
                      setFormVenta({ ...formVenta, nombre: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    placeholder="Pérez"
                    value={formVenta.apellido}
                    onChange={(e) =>
                      setFormVenta({ ...formVenta, apellido: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  placeholder="Ingrese la dirección"
                  value={formVenta.direccion}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, direccion: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lugar
                </label>
                <input
                  type="text"
                  placeholder="Ejm. San Andres, Lomas"
                  value={formVenta.lugar}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, lugar: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zona *
                </label>
                <select
                  value={formVenta.zona}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, zona: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                >
                  <option value="milagro">Milagro</option>
                  <option value="huanchaco">Huanchaco</option>
                  <option value="buenos aires">Buenos Aires</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Producto *
                </label>

                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={buscarProducto || ""}
                  onChange={(e) => {
                    setBuscarProducto(e.target.value)
                    setMostrarProductos(true)
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />

                {mostrarProductos && buscarProducto && (
                  <ul className="absolute z-20 w-full bg-white border rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg text-gray-800">
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((p) => (
                        <li
                          key={p.id}
                          onClick={() => {
                            setFormVenta({
                              ...formVenta,
                              producto: p,
                            })
                            setBuscarProducto(p.nombre)
                            setMostrarProductos(false)
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {p.nombre}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-400">
                        Producto no encontrado
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="text"
                  value={formVenta.cantidad}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, cantidad: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cobrador Asignado *
                </label>
                <select
                  value={formVenta.cobradorId}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, cobradorId: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                >
                  <option value="">Seleccionar cobrador</option>
                  {cobradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} - {c.zona}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Forma de Pago *
                </label>
                <select
                  value={formVenta.frecuenciaPago}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, frecuenciaPago: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                >
                  <option value="semanal">Semanal (S)</option>
                  <option value="quincenal">Quincenal (Q)</option>
                  <option value="mensual">Mensual (M)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Día de Cobranza
                </label>
                <input
                  type="text"
                  value={formVenta.diaCobro}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, diaCobro: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendedor
                </label>
                <input
                  type="text"
                  value={formVenta.vendedor}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, vendedor: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Venta *
                </label>
                <input
                  type="date"
                  value={formVenta.fechaVenta}
                  onChange={(e) =>
                    setFormVenta({ ...formVenta, fechaVenta: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio Venta
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formVenta.precioTotal ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    setFormVenta({ ...formVenta, precioTotal: value })
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Saldo Actual *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formVenta.monto}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    setFormVenta((prev) => ({ ...prev, monto: value }))
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
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
                    className="w-6 h-6 text-green-600"
                  />
                  <span className="text-lg font-semibold text-gray-700">
                    ¿Dio inicial?
                  </span>
                </label>

                {formVenta.dioInicial && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monto Inicial
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formVenta.inicial}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setFormVenta((prev) => ({ ...prev, inicial: value }))
                        setMostrarSaldo(false)
                      }}
                      onBlur={() => setMostrarSaldo(true)}
                      className="w-full p-3 border-2 border-green-300 rounded-xl focus:border-green-500 focus:outline-none text-gray-800"
                    />

                    {mostrarSaldo && formVenta.monto && formVenta.inicial && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          Saldo después del inicial:
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          S/ {saldo.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={registrarVenta}
                className="w-full bg-green-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-6 h-6 mr-2" />
                Registrar Venta
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentasForm
