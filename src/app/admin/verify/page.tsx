'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PASSWORD = 'examgo2026'

export default function AdminVerify() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })

  const loadStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
    if (data) {
      setStudents(data)
      setCounts({
        pending: data.filter(s => !s.verified && s.admit_card_url).length,
        approved: data.filter(s => s.verified).length,
        rejected: data.filter(s => !s.verified && !s.admit_card_url).length
      })
    }
  }

  useEffect(() => { if (authed) loadStudents() }, [authed])

  const approve = async (id: string, phone: string) => {
    await supabase.from('students').update({ verified: true }).eq('id', id)
    await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, student_id: id }) })
    loadStudents()
  }

  const reject = async (id: string) => {
    await supabase.from('students').update({ verified: false }).eq('id', id)
    loadStudents()
  }

  if (!authed) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
        <input type="password" placeholder="Password" className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4" value={pass} onChange={e => setPass(e.target.value)} />
        <button onClick={() => pass === PASSWORD && setAuthed(true)} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg">Login</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Verification Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-900 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-yellow-400">{counts.pending}</p><p className="text-yellow-200">Pending</p></div>
        <div className="bg-green-900 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-green-400">{counts.approved}</p><p className="text-green-200">Approved</p></div>
        <div className="bg-red-900 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-red-400">{counts.rejected}</p><p className="text-red-200">Rejected</p></div>
      </div>
      <div className="space-y-4">
        {students.map(s => (
          <div key={s.id} className="bg-gray-900 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{s.name}</p>
              <p className="text-gray-400 text-sm">{s.phone} · {s.exam_name} · {s.city}</p>
              <p className="text-gray-400 text-sm">{s.exam_date}</p>
              {s.admit_card_url && <a href={s.admit_card_url} target="_blank" className="text-blue-400 text-sm underline">View Admit Card</a>}
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${s.verified ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}>{s.verified ? 'Approved' : 'Pending'}</span>
              {!s.verified && <button onClick={() => approve(s.id, s.phone)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>}
              <button onClick={() => reject(s.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}