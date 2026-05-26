'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
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
          <p className="text-gray-500">Thank you for contributing. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Salary</h1>
        <p className="text-gray-500 text-sm mb-8">Anonymous. Helps the community.</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

          <Field
            label="Company Name *"
            name="companyName"
            placeholder="e.g. Google, Flipkart"
            value={form.companyName}
            error={errors.companyName}
            onChange={v => update('companyName', v)}
          />

          <Field
            label="Role *"
            name="role"
            placeholder="e.g. Software Engineer"
            value={form.role}
            error={errors.role}
            onChange={v => update('role', v)}
          />

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Level *
            </label>
            <select
              id="level"
              value={form.level}
              onChange={e => update('level', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.level ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select level</option>
              {['L3','L4','L5','L6','SDE-1','SDE-2','SDE-3','Senior','Staff','Principal'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
          </div>

          <Field
            label="Location *"
            name="location"
            placeholder="e.g. Bangalore"
            value={form.location}
            error={errors.location}
            onChange={v => update('location', v)}
          />

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={form.currency}
              onChange={e => update('currency', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <Field
            label="Base Salary (per year) *"
            name="baseSalary"
            type="number"
            placeholder="e.g. 2000000"
            value={form.baseSalary}
            error={errors.baseSalary}
            onChange={v => update('baseSalary', v)}
          />

          <Field
            label="Annual Bonus (0 if none)"
            name="bonus"
            type="number"
            placeholder="0"
            value={form.bonus}
            error={errors.bonus}
            onChange={v => update('bonus', v)}
          />

          <Field
            label="Annual Stock Value (0 if none)"
            name="stockValue"
            type="number"
            placeholder="0"
            value={form.stockValue}
            error={errors.stockValue}
            onChange={v => update('stockValue', v)}
          />

          <Field
            label="Years of Experience"
            name="yearsExp"
            type="number"
            placeholder="e.g. 3"
            value={form.yearsExp}
            error={errors.yearsExp}
            onChange={v => update('yearsExp', v)}
          />

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Salary Data'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            All submissions are anonymous. Total comp = base + bonus + stock.
          </p>
        </div>
      </div>
    </div>
  )
}