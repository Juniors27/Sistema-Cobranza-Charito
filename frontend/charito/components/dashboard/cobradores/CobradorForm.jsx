import { Plus } from "lucide-react"

const CobradorForm = ({
  form,
  setForm,
  editando,
  onGuardar,
  onCancelar
}) => {
  
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {editando ? "Editar Cobrador Existente" : "Agregar Nuevo Cobrador"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            placeholder="Nombre del cobrador"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Zona Asignada
          </label>
          <select
            value={form.zona}
            onChange={(e) =>
              setForm({ ...form, zona: e.target.value })
            }
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-800"
          >
            <option value="milagro">Milagro</option>
            <option value="huanchaco">Huanchaco</option>
            <option value="buenos aires">Buenos Aires</option>
          </select>
        </div>

        <button
          onClick={onGuardar}
          className="w-full bg-purple-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-6 h-6 mr-2" />
          {editando ? "Guardar Cambios" : "Agregar Cobrador"}
        </button>

        {editando && (
          <button
            onClick={onCancelar}
            className="w-full bg-gray-400 text-white p-4 rounded-xl text-lg font-semibold hover:bg-gray-500 transition-colors"
          >
            Cancelar Edición
          </button>
        )}
      </div>
    </div>
  )
}

export default CobradorForm
