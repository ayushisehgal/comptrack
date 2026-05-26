 
'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import FilterBar from '@/components/FilterBar'
import SalaryTable from '@/components/SalaryTable'

export default function HomePage() {
  const [entries, setEntries] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    company: '', role: '', level: '', location: '',
    sortBy: 'totalComp', sortOrder: 'desc'
  })

  useEffect(() => { fetchData() }, [filters, page])

  async function fetchData() {
  setLoading(true)
  try {
    const params = new URLSearchParams({
      ...filters,
      page: String(page),
      limit: '20',
    })

    const res = await fetch(`/api/salaries?${params}`)
    const data = await res.json()

    // ✅ SAFE FALLBACKS (CRITICAL FIX)
    setEntries(Array.isArray(data?.entries) ? data.entries : [])
    setTotal(typeof data?.total === 'number' ? data.total : 0)

  } catch (err) {
    console.error('Fetch error:', err)
    setEntries([])   // ✅ prevent crash
    setTotal(0)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compensation Intelligence</h1>
          <p className="text-gray-500 mt-1">{total} salary data points from real engineers</p>
        </div>
        <FilterBar filters={filters} onFilterChange={(f) => { setFilters(f); setPage(1) }} />
        <SalaryTable entries={entries} loading={loading} />
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100">Previous</button>
          <span className="px-4 py-2 text-gray-600">Page {page}</span>
          <button disabled={entries.length < 20} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  )
}