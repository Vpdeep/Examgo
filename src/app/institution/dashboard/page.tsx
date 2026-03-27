'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InstitutionDashboard() {
  const [phone, setPhone] = useState('')
  const [authed, setAuthed] = useState(false)
  const [institution, setInstitution] = useState<any>(null)
  const [scholarships, setScholarships] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', type: 'Coaching', stream: 'Any', min_tier: 'Merit', value: '', deadline: '', contact_email: '', apply_url: '' })

  const handleLogin = async () => {
    const { data } = await supabase.from('institutions').select('*').eq('phone', phone).limit(1)
    if (data && data.length > 0) {
      setInstitution(data[0])
      setAuthed(true)
      supabase.from('scholarships').select('*').eq('institution_id', data[0].id).then(({ data: s }) => setScholarships(s || []))
      supabase.from('scholar_leads').select('*').eq('institute_phone', phone).then(({ data: a }) => setApplications(a || []))
    } else {
      await supabase.from('institutions').insert([{ phone, name: 'New Institution' }])
      const { data: newInst } = await supabase.from('institutions').select('*').eq('phone', phone).limit(1)
      setInstitution(newInst?.[0] || { phone, name: 'New Institution' })
      setAuthed(true)
    }
  }

  const handleAddScholarship = async () => {
    const { error } = await supabase.from('scholarships').insert([{ ...form, institution_id: institution.id, institution_name: institution.name }])
    if (error) { alert('Error: ' + error.message); return }
    setShowForm(false)
    supabase.from('scholarships').select('*').eq('institution_id', institution.id).then(({ data: s }) => setScholarships(s || []))
  }

  if (!authed) return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
      <div className="bg-[#111827] p-8 rounded-xl w-full max-w-sm">
        <h1 className="text-xl font-bold mb-2">Institution Portal</h1>
        <p className="text-gray-400 text-sm mb-4">Login with your registered phone number</p>
        <input className="w-full bg-[#1f2937] text-white rounded px-3 py-2 mb-3" placeholder="Phone number" value={phone} onChange={function(e) { setPhone(e.target.value) }} />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Login</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{institution.name}</h1>
      <p className="text-gray-400 text-sm mb-6">Institution Partner Portal</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{scholarships.length}</p>
          <p className="text-gray-400 text-sm">Scholarships Listed</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{applications.length}</p>
          <p className="text-gray-400 text-sm">Applications Received</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Your Scholarships</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg">+ Add Scholarship</button>
      </div>

      {showForm && (
        <div className="bg-[#111827] rounded-xl p-4 mb-4 space-y-3">
          {[
            { key: 'title', label: 'Scholarship Title' },
            { key: 'description', label: 'Description' },
            { key: 'value', label: 'Value (e.g. 50% fee waiver)' },
            { key: 'deadline', label: 'Deadline (YYYY-MM-DD)' },
            { key: 'contact_email', label: 'Contact Email' },
            { key: 'apply_url', label: 'Apply URL (optional)' },
          ].map(function(f) {
            return (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm" value={form[f.key as keyof typeof form]} onChange={function(e) { setForm({ ...form, [f.key]: e.target.value }) }} />
              </div>
            )
          })}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Minimum Tier Required</label>
            <select className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm" value={form.min_tier} onChange={function(e) { setForm({ ...form, min_tier: e.target.value }) }}>
              <option value="Merit">Merit</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stream</label>
            <select className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm" value={form.stream} onChange={function(e) { setForm({ ...form, stream: e.target.value }) }}>
              <option value="Any">Any</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Civil Services">Civil Services</option>
              <option value="Banking">Banking</option>
            </select>
          </div>
          <button onClick={handleAddScholarship} className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold">Save Scholarship</button>
        </div>
      )}

      {scholarships.map(function(s) {
        return (
          <div key={s.id} className="bg-[#111827] rounded-lg p-4 mb-2">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">{s.title}</p>
              <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">{s.min_tier}+</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">{s.value} · Deadline: {s.deadline}</p>
          </div>
        )
      })}

      {applications.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Applications Received</h2>
          {applications.map(function(a) {
            return (
              <div key={a.id} className="bg-[#111827] rounded-lg p-3 mb-2 text-sm">
                <p className="font-medium">{a.student_name} — {a.scholar_tier}</p>
                <p className="text-gray-400 text-xs">{a.exam_name} · {a.student_city}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}