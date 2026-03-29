'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { institutionRegisterSchema } from '@/lib/validation'
import { Spinner } from '@/components/ui/spinner'

export default function InstitutionRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', type: 'Coaching', contact_email: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    const parsed = institutionRegisterSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(', '))
      return
    }
    setLoading(true)
    const { error: insErr } = await supabase.from('institutions').insert([parsed.data])
    setLoading(false)
    if (insErr) {
      setError(insErr.message)
      return
    }
    localStorage.setItem('institutionPhone', parsed.data.phone)
    router.push('/institution/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-md mx-auto min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Institution Registration</h1>
      <p className="text-gray-400 text-sm mb-6">Join ExamGo as a scholarship partner</p>
      {error && <p className="text-red-400 text-sm mb-4 break-words">{error}</p>}

      {[
        { key: 'name' as const, label: 'Institution Name' },
        { key: 'phone' as const, label: 'Phone Number (10 digits)' },
        { key: 'contact_email' as const, label: 'Contact Email' },
        { key: 'city' as const, label: 'City' },
      ].map((f) => (
        <div key={f.key} className="mb-4">
          <label className="text-sm text-gray-400 mb-1 block">{f.label}</label>
          <input
            className="w-full min-w-0 bg-[#111827] text-white rounded px-3 py-2 text-base"
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            inputMode={f.key === 'phone' ? 'numeric' : undefined}
            maxLength={f.key === 'phone' ? 10 : undefined}
          />
        </div>
      ))}

      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-1 block">Type</label>
        <select
          className="w-full bg-[#111827] text-white rounded px-3 py-2 text-base"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="Coaching">Coaching Institute</option>
          <option value="College">College</option>
          <option value="Corporate CSR">Corporate CSR</option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Spinner className="text-white" /> : null}
        {loading ? 'Registering…' : 'Register'}
      </button>
    </div>
  )
}
