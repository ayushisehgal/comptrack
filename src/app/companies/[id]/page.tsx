'use client'
import { useEffect, useState } from 'react'
import { use } from 'react'
import Navbar from '@/components/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8 text-gray-400">Loading...</div>
    </div>
  )

  if (!data?.company) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8 text-red-500">Company not found</div>
    </div>
  )

  const { company, stats } = data
  const levelChartData = Object.entries(stats.byLevel || {}).map(([level, v]: any) => ({
    level, avgTC: Math.round(v.avgTC / 100000)
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          {company.industry && <p className="text-gray-500">{company.industry} · {company.hq}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Median TC', value: fmt(stats.medianTC) },
            { label: 'Avg Base', value: fmt(stats.avgBase) },
            { label: 'Avg Bonus', value: fmt(stats.avgBonus) },
            { label: 'Data Points', value: stats.count },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-gray-500 text-sm">{s.label}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{s.value}</div>
            </div>
          ))}
        </div>
        {levelChartData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="font-semibold text-gray-800 mb-4">Avg Total Comp by Level (₹ Lakhs)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={levelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => `₹${v}L`} />
                <Bar dataKey="avgTC" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Role','Level','Location','Base','Bonus','Stock','Total TC'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {company.salaryEntries.map((e: any) => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{e.role}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{e.level}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.location}</td>
                  <td className="px-4 py-3">{fmt(e.baseSalary)}</td>
                  <td className="px-4 py-3 text-green-600">{e.bonus > 0 ? fmt(e.bonus) : '—'}</td>
                  <td className="px-4 py-3 text-blue-600">{e.stockValue > 0 ? fmt(e.stockValue) : '—'}</td>
                  <td className="px-4 py-3 font-bold">{fmt(e.totalComp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}