'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MerchantRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ business_name: '', contact_phone: '', city: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabase.from('merchants').insert([form])
    setLoading(false)
    if (error) { alert('Error: ' + error.message); return }
    setDone(true)
    localStorage.setItem('merchantPhone', form.contact_phone)
    setTimeout(() => router.push('/merchant/dashboard'), 2000)
  }

  if (done) return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
      <p className="text-green-400 text-lg">Registered! Redirecting...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Merchant Registration</h1>
      {[
        { key: 'business_name', label: 'Business Name' },
        { key: 'contact_phone', label: 'Phone Number' },
        { key: 'city', label: 'City' },
      ].map(function(field) {
        return (
          <div key={field.key} className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">{field.label}</label>
            <input
              className="w-full bg-[#111827] text-white rounded px-3 py-2"
              value={form[field.key as keyof typeof form]}
              onChange={function(e) { setForm({ ...form, [field.key]: e.target.value }) }}
            />
          </div>
        )
      })}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-1 block">Category</label>
        <select
          className="w-full bg-[#111827] text-white rounded px-3 py-2"
          value={form.category}
          onChange={function(e) { setForm({ ...form, category: e.target.value }) }}
        >
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Stay">Stay</option>
          <option value="Transport">Transport</option>
          <option value="Pharmacy">Pharmacy</option>
        </select>
      </div>
      <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  )
}