export function ExportButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Exportar Excel
    </button>
  )
}

