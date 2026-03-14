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
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
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
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 focus:border-sky-600 focus:outline-none"
          >
            <option value="milagro">Milagro</option>
            <option value="huanchaco">Huanchaco</option>
            <option value="buenos aires">Buenos Aires</option>
          </select>
        </div>

        <button
          onClick={onGuardar}
          className="flex w-full items-center justify-center rounded-xl bg-sky-700 p-4 text-lg font-semibold text-white transition-colors hover:bg-sky-800"
        >
          <Plus className="w-6 h-6 mr-2" />
          {editando ? "Guardar Cambios" : "Agregar Cobrador"}
        </button>

        {editando && (
          <button
            onClick={onCancelar}
            className="w-full rounded-xl bg-slate-300 p-4 text-lg font-semibold text-slate-800 transition-colors hover:bg-slate-400"
          >
            Cancelar Edición
          </button>
        )}
      </div>
    </div>
  )
}

export default CobradorForm
