'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { signIn, signOut, useSession } from "next-auth/react"

interface FieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  value: string
  error?: string
  onChange: (val: string) => void
}

function Field({ label, name, type = 'text', placeholder = '', value, error, onChange }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function SubmitPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [form, setForm] = useState({
    companyName: '',
    role: '',
    level: '',
    location: '',
    currency: 'INR',
    baseSalary: '',
    bonus: '',
    stockValue: '',
    yearsExp: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.companyName.trim()) e.companyName = 'Required'
    if (!form.role.trim()) e.role = 'Required'
    if (!form.level) e.level = 'Required'
    if (!form.location.trim()) e.location = 'Required'
    if (!form.baseSalary || Number(form.baseSalary) <= 0)
      e.baseSalary = 'Enter a valid salary greater than 0'
    return e
  }

  async function handleSubmit() {
    setSubmitError('')

    if (!session) {
      setSubmitError('Please login first')
      return
    }

    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }

    setLoading(true)

    try {
      const payload = {
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        level: form.level,
        location: form.location.trim(),
        currency: form.currency,
        baseSalary: parseFloat(form.baseSalary),
        bonus: form.bonus ? parseFloat(form.bonus) : 0,
        stockValue: form.stockValue ? parseFloat(form.stockValue) : 0,
        yearsExp: form.yearsExp ? parseInt(form.yearsExp) : undefined,
      }

      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/'), 2000)
      }

    } catch {
      setSubmitError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted!</h2>
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-12">

        {/* 🔥 LOGIN / LOGOUT */}
        <div className="flex justify-end mb-4">
          {!session ? (
            <button
              onClick={() => signIn()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Salary</h1>
        <p className="text-gray-500 text-sm mb-8">Anonymous. Helps the community.</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

          <Field label="Company Name *" name="companyName" value={form.companyName} error={errors.companyName} onChange={v => update('companyName', v)} />
          <Field label="Role *" name="role" value={form.role} error={errors.role} onChange={v => update('role', v)} />

          <select
            value={form.level}
            onChange={e => update('level', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select level</option>
            {['L3','L4','L5','L6','SDE-1','SDE-2','Senior'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <Field label="Location *" name="location" value={form.location} error={errors.location} onChange={v => update('location', v)} />
          <Field label="Base Salary *" name="baseSalary" type="number" value={form.baseSalary} error={errors.baseSalary} onChange={v => update('baseSalary', v)} />
          <Field label="Bonus" name="bonus" type="number" value={form.bonus} onChange={v => update('bonus', v)} />
          <Field label="Stock Value" name="stockValue" type="number" value={form.stockValue} onChange={v => update('stockValue', v)} />
          <Field label="Years Exp" name="yearsExp" type="number" value={form.yearsExp} onChange={v => update('yearsExp', v)} />

          {submitError && (
            <div className="text-red-500 text-sm">{submitError}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg"
          >
            {loading ? 'Submitting...' : 'Submit Salary'}
          </button>

        </div>
      </div>
    </div>
  )
}