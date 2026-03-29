'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'examgo2026'

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('stats')
  const [students, setStudents] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [scholarLeads, setScholarLeads] = useState<any[]>([])

  useEffect(() => {
    if (!authed) return
    supabase.from('students').select('*').then(({ data }) => setStudents(data || []))
    supabase.from('merchants').select('*').then(({ data }) => setMerchants(data || []))
    supabase.from('deals').select('*').then(({ data }) => setDeals(data || []))
    supabase.from('redemptions').select('*').then(({ data }) => setRedemptions(data || []))
    supabase.from('scholar_leads').select('*').then(({ data }) => setScholarLeads(data || []))
  }, [authed])

  const handleVerify = async (id: string, status: boolean) => {
    await supabase.from('students').update({ is_verified: status }).eq('id', id)
    setStudents(students.map(function(s) { return s.id === id ? { ...s, is_verified: status } : s }))
  }

  const handleMerchantVerify = async (id: string, status: boolean) => {
    await supabase.from('merchants').update({ verified: status }).eq('id', id)
    setMerchants(merchants.map(function(m) { return m.id === id ? { ...m, verified: status } : m }))
  }

  const handleDealToggle = async (id: string, status: boolean) => {
    await supabase.from('deals').update({ active: status }).eq('id', id)
    setDeals(deals.map(function(d) { return d.id === id ? { ...d, active: status } : d }))
  }

  const exportCSV = (data: any[], filename: string) => {
    const keys = Object.keys(data[0] || {})
    const csv = [keys.join(','), ...data.map(function(row) { return keys.map(function(k) { return row[k] }).join(',') })].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = filename
    a.click()
  }

  const todayRedemptions = redemptions.filter(function(r) {
    return new Date(r.created_at).toDateString() === new Date().toDateString()
  }).length

  const weekRedemptions = redemptions.filter(function(r) {
    return (Date.now() - new Date(r.created_at).getTime()) < 7 * 86400000
  }).length

  if (!authed) return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
      <div className="bg-[#111827] p-8 rounded-xl w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <input
          type="password"
          className="w-full bg-[#1f2937] text-white rounded px-3 py-2 mb-3"
          placeholder="Enter password"
          value={password}
          onChange={function(e) { setPassword(e.target.value) }}
        />
        <button
          onClick={function() { if (password === ADMIN_PASSWORD) setAuthed(true); else alert('Wrong password') }}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['stats', 'students', 'merchants', 'deals', 'scholar'].map(function(t) {
          return (
            <button key={t} onClick={() => setTab(t)} className={"px-4 py-2 rounded-lg text-sm font-semibold capitalize " + (tab === t ? 'bg-blue-600' : 'bg-[#111827]')}>
              {t}
            </button>
          )
        })}
      </div>

      {tab === 'stats' && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Students', value: students.length, color: 'text-blue-400' },
            { label: 'Verified Students', value: students.filter(function(s) { return s.is_verified }).length, color: 'text-green-400' },
            { label: 'Total Merchants', value: merchants.length, color: 'text-yellow-400' },
            { label: 'Total Redemptions', value: redemptions.length, color: 'text-purple-400' },
            { label: 'Redemptions Today', value: todayRedemptions, color: 'text-pink-400' },
            { label: 'Redemptions This Week', value: weekRedemptions, color: 'text-orange-400' },
            { label: 'Active Deals', value: deals.filter(function(d) { return d.active }).length, color: 'text-cyan-400' },
            { label: 'Scholar Leads', value: scholarLeads.length, color: 'text-indigo-400' },
          ].map(function(stat) {
            return (
              <div key={stat.label} className="bg-[#111827] rounded-xl p-4 text-center">
                <p className={"text-3xl font-bold " + stat.color}>{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'students' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Students ({students.length})</h2>
            <button onClick={() => exportCSV(students, 'students.csv')} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg">Export CSV</button>
          </div>
          {students.map(function(s) {
            return (
              <div key={s.id} className="bg-[#111827] rounded-lg p-4 mb-2 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">{s.name} — {s.phone}</p>
                  <p className="text-gray-400 text-xs">{s.city} · {s.exam_name}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={"text-xs px-2 py-1 rounded-full " + (s.is_verified ? 'bg-green-700' : 'bg-yellow-700')}>{s.is_verified ? 'Verified' : 'Pending'}</span>
                  {!s.is_verified && <button onClick={() => handleVerify(s.id, true)} className="bg-green-600 text-white text-xs px-3 py-1 rounded">Approve</button>}
                  {s.is_verified && <button onClick={() => handleVerify(s.id, false)} className="bg-red-600 text-white text-xs px-3 py-1 rounded">Reject</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'merchants' && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Merchants ({merchants.length})</h2>
          {merchants.map(function(m) {
            return (
              <div key={m.id} className="bg-[#111827] rounded-lg p-4 mb-2 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">{m.business_name} — {m.contact_phone}</p>
                  <p className="text-gray-400 text-xs">{m.city} · {m.category}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={"text-xs px-2 py-1 rounded-full " + (m.verified ? 'bg-green-700' : 'bg-yellow-700')}>{m.verified ? 'Verified' : 'Pending'}</span>
                  {!m.verified && <button onClick={() => handleMerchantVerify(m.id, true)} className="bg-green-600 text-white text-xs px-3 py-1 rounded">Approve</button>}
                  {m.verified && <button onClick={() => handleMerchantVerify(m.id, false)} className="bg-red-600 text-white text-xs px-3 py-1 rounded">Reject</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'deals' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Deals ({deals.length})</h2>
            <button onClick={() => exportCSV(redemptions, 'redemptions.csv')} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg">Export Redemptions CSV</button>
          </div>
          {deals.map(function(d) {
            return (
              <div key={d.id} className="bg-[#111827] rounded-lg p-4 mb-2 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">{d.title}</p>
                  <p className="text-gray-400 text-xs">{d.city} · {d.discount_percent}% off</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={"text-xs px-2 py-1 rounded-full " + (d.active ? 'bg-green-700' : 'bg-red-700')}>{d.active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => handleDealToggle(d.id, !d.active)} className="bg-gray-600 text-white text-xs px-3 py-1 rounded">{d.active ? 'Deactivate' : 'Activate'}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'scholar' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Scholar Leads ({scholarLeads.length})</h2>
            <button onClick={() => exportCSV(scholarLeads, 'scholar_leads.csv')} className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg">Export CSV</button>
          </div>
          {scholarLeads.map(function(l) {
            return (
              <div key={l.id} className="bg-[#111827] rounded-lg p-4 mb-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-sm">{l.student_name} — {l.scholar_tier}</p>
                    <p className="text-gray-400 text-xs">{l.exam_name} · {l.student_city} · {l.student_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 text-xs font-semibold">{l.institute_name}</p>
                    <p className="text-gray-400 text-xs">{l.offer}</p>
                  </div>
                </div>
              </div>
            )
          })}
          {scholarLeads.length === 0 && <p className="text-gray-500 text-sm">No leads yet.</p>}
        </div>
      )}
    </div>
  )
}