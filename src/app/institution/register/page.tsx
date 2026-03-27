'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function InstitutionRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', type: 'Coaching', contact_email: '', city: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { alert('Name and phone are required'); return }
    setLoading(true)
    const { error } = await supabase.from('institutions').insert([form])
    setLoading(false)
    if (error) { alert('Error: ' + error.message); return }
    localStorage.setItem('institutionPhone', form.phone)
    router.push('/institution/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Institution Registration</h1>
      <p className="text-gray-400 text-sm mb-6">Join ExamGo as a scholarship partner</p>

      {[
        { key: 'name', label: 'Institution Name' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'contact_email', label: 'Contact Email' },
        { key: 'city', label: 'City' },
      ].map(function(f) {
        return (
          <div key={f.key} className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">{f.label}</label>
            <input
              className="w-full bg-[#111827] text-white rounded px-3 py-2"
              value={form[f.key as keyof typeof form]}
              onChange={function(e) { setForm({ ...form, [f.key]: e.target.value }) }}
            />
          </div>
        )
      })}

      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-1 block">Type</label>
        <select className="w-full bg-[#111827] text-white rounded px-3 py-2" value={form.type} onChange={function(e) { setForm({ ...form, type: e.target.value }) }}>
          <option value="Coaching">Coaching Institute</option>
          <option value="College">College</option>
          <option value="Corporate CSR">Corporate CSR</option>
        </select>
      </div>

      <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  )
}