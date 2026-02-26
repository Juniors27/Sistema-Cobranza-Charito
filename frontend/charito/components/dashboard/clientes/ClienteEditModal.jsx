"use client"

export default function ClienteEditModal({
  ventaEditar,
  setVentaEditar,
  guardarEdicion,
  setModalEditar,
  cobradores,

  productos,
  productoSeleccionado,
  setProductoSeleccionado,
  buscarProductoEdit,
  setBuscarProductoEdit,
  mostrarProductosEdit,
  setMostrarProductosEdit
}) {
  if (!ventaEditar) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-gray-800">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">

        <h2 className="text-2xl font-bold mb-6">
          Editar Cliente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Número de Contrato */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Número de Contrato
            </label>
            <input
              type="text"
              value={ventaEditar.numero_contrato}
              disabled
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {/* Fecha Venta */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Fecha de Venta
            </label>
            <input
              type="date"
              value={
                ventaEditar.fecha_venta
                  ? ventaEditar.fecha_venta.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  fecha_venta: e.target.value
                })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={ventaEditar.nombre}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  nombre: e.target.value
                })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={ventaEditar.apellido}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  apellido: e.target.value
                })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {/* Dirección */}
          <div >
            <label className="block text-sm font-semibold mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={ventaEditar.direccion}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  direccion: e.target.value
                })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {/* Zona */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Zona
            </label>
            <select
              value={ventaEditar.zona}
              onChange={(e) =>
                setVentaEditar({
                  ...ventaEditar,
                  zona: e.target.value
                })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            >
              <option value="milagro">Milagro</option>
              <option value="huanchaco">Huanchaco</option>
              <option value="buenos aires">Buenos Aires</option>
            </select>
          </div>

          {/* Producto con autocompletado */}
          <div className=" relative">
            <label className="block text-sm font-semibold mb-2">
              Producto *
            </label>

            <input
              type="text"
              value={buscarProductoEdit}
              onChange={(e) => {
                setBuscarProductoEdit(e.target.value)
                setMostrarProductosEdit(true)
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
              placeholder="Buscar producto..."
            />

            {mostrarProductosEdit && (
              <div className="absolute z-50 w-full bg-white border rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                {productos
                  .filter((p) =>
                    p.nombre.toLowerCase().includes(buscarProductoEdit.toLowerCase())
                  )
                  .map((producto) => (
                    <div
                      key={producto.id}
                      onClick={() => {
                        setProductoSeleccionado(producto)
                        setBuscarProductoEdit(producto.nombre)
                        setMostrarProductosEdit(false)
                      }}
                      className="p-3 hover:bg-indigo-50 cursor-pointer"
                    >
                      {producto.nombre}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
            <input
              type="number"
              value={ventaEditar.cantidad || 1}
              onChange={(e) => setVentaEditar({ ...ventaEditar, cantidad: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Precio Total */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Total</label>
            <input
              type="number"
              step="0.01"
              value={ventaEditar.precio_total || ''}
              onChange={(e) => setVentaEditar({ ...ventaEditar, precio_total: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Monto (Saldo Actual) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Saldo Actual *</label>
            <input
              type="number"
              step="0.01"
              value={ventaEditar.monto}
              onChange={(e) => setVentaEditar({ ...ventaEditar, monto: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>


          {/* Frecuencia de Pago */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Forma de Pago *</label>
            <select
              value={ventaEditar.frecuencia_pago}
              onChange={(e) => setVentaEditar({ ...ventaEditar, frecuencia_pago: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="semanal">Semanal (S)</option>
              <option value="quincenal">Quincenal (Q)</option>
              <option value="mensual">Mensual (M)</option>
            </select>
          </div>

          {/* Día de Cobro */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Día de Cobranza</label>
            <input
              type="text"
              value={ventaEditar.dia_cobro || ''}
              onChange={(e) => setVentaEditar({ ...ventaEditar, dia_cobro: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Vendedor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vendedor</label>
            <input
              type="text"
              value={ventaEditar.vendedor || ''}
              onChange={(e) => setVentaEditar({ ...ventaEditar, vendedor: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Cobrador */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cobrador Asignado *</label>
            <select
              value={ventaEditar.cobrador || ''}
              onChange={(e) => setVentaEditar({ ...ventaEditar, cobrador: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
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

        {/* Botones */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={guardarEdicion}
            className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Guardar Cambios
          </button>

          <button
            onClick={() => setModalEditar(false)}
            className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-xl font-semibold hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  )
}
