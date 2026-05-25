'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: '' }))
  }

  function validate() {
    const errors: Record<string, string> = {}
    if (!form.companyName.trim()) errors.companyName = 'Required'
    if (!form.role.trim()) errors.role = 'Required'
    if (!form.level) errors.level = 'Required'
    if (!form.location.trim()) errors.location = 'Required'
    if (!form.baseSalary || isNaN(Number(form.baseSalary)) || Number(form.baseSalary) <= 0)
      errors.baseSalary = 'Enter a valid salary greater than 0'
    if (form.bonus && isNaN(Number(form.bonus)))
      errors.bonus = 'Must be a number'
    if (form.stockValue && isNaN(Number(form.stockValue)))
      errors.stockValue = 'Must be a number'
    return errors
  }

  async function handleSubmit() {
    setError('')
    setFieldErrors({})

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
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

      console.log('Sending payload:', payload)

      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log('Response:', data)

      if (!res.ok) {
        if (data.details?.fieldErrors) {
          const fe: Record<string, string> = {}
          Object.entries(data.details.fieldErrors).forEach(([k, v]: any) => {
            fe[k] = Array.isArray(v) ? v[0] : v
          })
          setFieldErrors(fe)
          setError('Please fix the errors below')
        } else {
          setError(data.error || 'Submission failed')
        }
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/'), 2000)
      }
    } catch (err) {
      console.error(err)
      setError('Network error — please try again')
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
          <p className="text-gray-500">Thank you for contributing. Redirecting to salary table...</p>
        </div>
      </div>
    )
  }

  const inputClass = (key: string) =>
    `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      fieldErrors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  const Field = ({ label, name, type = 'text', placeholder = '' }: {
    label: string, name: string, type?: string, placeholder?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={(form as any)[name]}
        placeholder={placeholder}
        onChange={e => update(name, e.target.value)}
        className={inputClass(name)}
      />
      {fieldErrors[name] && (
        <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Salary</h1>
        <p className="text-gray-500 text-sm mb-8">Anonymous. Helps the community.</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

          <Field label="Company Name *" name="companyName" placeholder="e.g. Google, Flipkart" />
          <Field label="Role *" name="role" placeholder="e.g. Software Engineer" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
            <select
              value={form.level}
              onChange={e => update('level', e.target.value)}
              className={inputClass('level')}
            >
              <option value="">Select level</option>
              {['L3','L4','L5','L6','SDE-1','SDE-2','SDE-3','Senior','Staff','Principal'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {fieldErrors.level && <p className="text-red-500 text-xs mt-1">{fieldErrors.level}</p>}
          </div>

          <Field label="Location *" name="location" placeholder="e.g. Bangalore" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={e => update('currency', e.target.value)}
              className={inputClass('currency')}
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
          />

          <Field
            label="Annual Bonus (leave 0 if none)"
            name="bonus"
            type="number"
            placeholder="0"
          />

          <Field
            label="Annual Stock Value (leave 0 if none)"
            name="stockValue"
            type="number"
            placeholder="0"
          />

          <Field
            label="Years of Experience"
            name="yearsExp"
            type="number"
            placeholder="e.g. 3"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
              {error}
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
            All submissions are anonymous. Total comp is auto-calculated as base + bonus + stock.
          </p>
        </div>
      </div>
    </div>
  )
}