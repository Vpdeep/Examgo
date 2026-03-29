'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { merchantRegisterSchema } from '@/lib/validation'
import { Spinner } from '@/components/ui/spinner'

export default function MerchantRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ business_name: '', contact_phone: '', city: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    const parsed = merchantRegisterSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(', '))
      return
    }
    setLoading(true)
    const { error: insErr } = await supabase.from('merchants').insert([parsed.data])
    setLoading(false)
    if (insErr) {
      setError(insErr.message)
      return
    }
    setDone(true)
    localStorage.setItem('merchantPhone', parsed.data.contact_phone)
    setTimeout(() => router.push('/merchant/dashboard'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <p className="text-green-400 text-lg text-center">Registered! Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-md mx-auto min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Merchant Registration</h1>
      {error && <p className="text-red-400 text-sm mb-4 break-words">{error}</p>}
      {[
        { key: 'business_name' as const, label: 'Business Name' },
        { key: 'contact_phone' as const, label: 'Phone Number' },
        { key: 'city' as const, label: 'City' },
      ].map((field) => (
        <div key={field.key} className="mb-4">
          <label className="text-sm text-gray-400 mb-1 block">{field.label}</label>
          <input
            className="w-full min-w-0 bg-[#111827] text-white rounded px-3 py-2 text-base"
            value={form[field.key]}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            inputMode={field.key === 'contact_phone' ? 'numeric' : 'text'}
          />
        </div>
      ))}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-1 block">Category</label>
        <select
          className="w-full bg-[#111827] text-white rounded px-3 py-2 text-base"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Stay">Stay</option>
          <option value="Transport">Transport</option>
          <option value="Pharmacy">Pharmacy</option>
        </select>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !form.category}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Spinner className="text-white" /> : null}
        {loading ? 'Registering…' : 'Register'}
      </button>
    </div>
  )
}
