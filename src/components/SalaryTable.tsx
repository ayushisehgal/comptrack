const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`

export default function SalaryTable({ entries, loading }: { entries: any[], loading: boolean }) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-14 border-b border-gray-100 animate-pulse bg-gray-50 mx-4 my-2 rounded" />
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Company','Role','Level','Location','Base','Bonus','Stock','Total TC','Exp'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e: any) => (
            <tr key={e.id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
              <td className="px-4 py-3 font-medium text-indigo-600">{e.company?.name}</td>
              <td className="px-4 py-3 text-gray-700">{e.role}</td>
              <td className="px-4 py-3">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{e.level}</span>
              </td>
              <td className="px-4 py-3 text-gray-500">{e.location}</td>
              <td className="px-4 py-3 text-gray-700">{fmt(e.baseSalary)}</td>
              <td className="px-4 py-3 text-green-600">{e.bonus > 0 ? fmt(e.bonus) : '—'}</td>
              <td className="px-4 py-3 text-blue-600">{e.stockValue > 0 ? fmt(e.stockValue) : '—'}</td>
              <td className="px-4 py-3 font-bold text-gray-900">{fmt(e.totalComp)}</td>
              <td className="px-4 py-3 text-gray-400">{e.yearsExp ? `${e.yearsExp}y` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-400">No results found. Try adjusting filters.</div>
      )}
    </div>
  )
} 
