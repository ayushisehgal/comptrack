 
'use client'

interface Filters {
  company: string; role: string; level: string; location: string
  sortBy: string; sortOrder: string
}

export default function FilterBar({ filters, onFilterChange }: {
  filters: Filters, onFilterChange: (f: Filters) => void
}) {
  const update = (key: string, value: string) => onFilterChange({ ...filters, [key]: value })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
      <input placeholder="Company" value={filters.company}
        onChange={e => update('company', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input placeholder="Role" value={filters.role}
        onChange={e => update('role', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select value={filters.level} onChange={e => update('level', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">All Levels</option>
        {['L3','L4','L5','L6','SDE-1','SDE-2','SDE-3'].map(l => <option key={l}>{l}</option>)}
      </select>
      <input placeholder="Location" value={filters.location}
        onChange={e => update('location', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select value={filters.sortBy} onChange={e => update('sortBy', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="totalComp">Sort: Total Comp</option>
        <option value="baseSalary">Sort: Base</option>
        <option value="createdAt">Sort: Recent</option>
      </select>
    </div>
  )
}