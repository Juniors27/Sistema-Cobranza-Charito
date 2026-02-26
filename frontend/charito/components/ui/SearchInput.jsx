export function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl"
    />
  )
}