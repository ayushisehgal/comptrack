'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`

export default function ComparePage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [compareData, setCompareData] = useState<any[]>([])
  const [loadingCompany, setLoadingCompany] = useState(false)

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setCompanies(d)
    })
  }, [])

  async function addCompany(id: string) {
    if (!id || selected.includes(id) || selected.length >= 3) return
    setLoadingCompany(true)
    try {
      const res = await fetch(`/api/companies/${id}`)
      const data = await res.json()
      if (!data?.company || !data?.stats) return
      setSelected(s => [...s, id])
      setCompareData(d => [...d, {
        id,
        name: data.company.name,
        medianTC: data.stats.medianTC || 0,
        avgBase: data.stats.avgBase || 0,
        avgBonus: data.stats.avgBonus || 0,
        avgStock: data.stats.avgStock || 0,
        count: data.stats.count || 0,
      }])
    } catch (err) {
      console.error('Failed to load company', err)
    } finally {
      setLoadingCompany(false)
    }
  }

  function removeCompany(id: string) {
    setSelected(s => s.filter(sid => sid !== id))
    setCompareData(d => d.filter(c => c.id !== id))
  }

  const chartData = [
    { metric: 'Median TC', ...Object.fromEntries(compareData.map(c => [c.name, Math.round(c.medianTC / 100000)])) },
    { metric: 'Avg Base', ...Object.fromEntries(compareData.map(c => [c.name, Math.round(c.avgBase / 100000)])) },
    { metric: 'Avg Bonus', ...Object.fromEntries(compareData.map(c => [c.name, Math.round(c.avgBonus / 100000)])) },
  ]

  const colors = ['#6366f1', '#10b981', '#f59e0b']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Companies</h1>
        <p className="text-gray-500 mb-8">Select up to 3 companies to compare compensation</p>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4">
          <select
            onChange={e => { addCompany(e.target.value); e.target.value = '' }}
            defaultValue=""
            disabled={loadingCompany || selected.length >= 3}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="" disabled>Add a company...</option>
            {companies
              .filter(c => !selected.includes(c.id))
              .map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            }
          </select>
          <span className="text-gray-400 text-sm">
            {loadingCompany ? 'Loading...' : `${selected.length}/3 selected`}
          </span>
        </div>

        {compareData.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {compareData.map((c, i) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-900">{c.name}</h3>
                    <button
                      onClick={() => removeCompany(c.id)}
                      className="text-gray-400 hover:text-red-500 text-xl leading-none"
                    >×</button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Median TC</span>
                      <span className="font-bold" style={{ color: colors[i] }}>{fmt(c.medianTC)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Base</span>
                      <span>{fmt(c.avgBase)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Bonus</span>
                      <span className="text-green-600">{fmt(c.avgBonus)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Stock</span>
                      <span className="text-blue-600">{fmt(c.avgStock)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data Points</span>
                      <span>{c.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                Side-by-side comparison (₹ Lakhs)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => `₹${v}L`} />
                  <Legend />
                  {compareData.map((c, i) => (
                    <Bar key={c.id} dataKey={c.name} fill={colors[i]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {compareData.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            Add companies above to start comparing
          </div>
        )}
      </div>
    </div>
  )
}
