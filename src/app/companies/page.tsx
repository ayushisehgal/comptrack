'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(d => { setCompanies(d); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Companies</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c: any) => (
              <Link key={c.id} href={`/companies/${c.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-sm transition">
                <div className="font-semibold text-gray-900 text-lg">{c.name}</div>
                {c.industry && <div className="text-gray-500 text-sm mt-1">{c.industry}</div>}
                <div className="text-indigo-600 text-sm mt-3 font-medium">
                  {c._count?.salaryEntries || 0} data points
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
