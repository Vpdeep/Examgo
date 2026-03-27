'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [phone, setPhone] = useState('')
  const [student, setStudent] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [error, setError] = useState('')
  const [daysLeft, setDaysLeft] = useState(0)

  const loadDashboard = async () => {
    setError('')
    const { data } = await supabase.from('students').select('*').eq('phone', phone).single()
    if (!data) { setError('Phone number not found'); return }
    setStudent(data)
    const examDate = new Date(data.exam_date)
    const today = new Date()
    const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    setDaysLeft(diff)
    const { data: dealsData } = await supabase.from('deals').select('*').eq('city', data.city).eq('active', true)
    setDeals(dealsData || [])
    const { data: redemptionsData } = await supabase.from('redemptions').select('*').eq('student_id', data.id)
    setRedemptions(redemptionsData || [])
  }

  if (!student) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">My Dashboard</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <input placeholder="Enter your mobile number" className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} />
        <button onClick={loadDashboard} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg">View Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Welcome, {student.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Verification Status</p>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${student.verified ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}>
            {student.verified ? '✅ Verified' : '⏳ Pending'}
          </span>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Exam</p>
          <p className="text-white font-bold">{student.exam_name}</p>
          <p className="text-gray-400 text-sm">{student.exam_date}</p>
        </div>
        <div className="bg-blue-900 p-4 rounded-xl text-center">
          <p className="text-4xl font-bold text-blue-300">{daysLeft}</p>
          <p className="text-blue-200">Days to Exam</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Available Deals in {student.city} ({deals.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {deals.map(deal => (
          <div key={deal.id} className="bg-gray-900 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-white font-bold">{deal.title}</p>
              <p className="text-gray-400 text-sm">{deal.description}</p>
            </div>
            {deal.discount_percent > 0 && <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg">{deal.discount_percent}%</span>}
          </div>
        ))}
      </div>

      {redemptions.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-white mb-4">My Deal Codes</h2>
          <div className="space-y-2">
            {redemptions.map(r => (
              <div key={r.id} className="bg-gray-900 p-4 rounded-xl flex justify-between">
                <p className="text-white font-bold tracking-widest">{r.code}</p>
                <span className={`text-sm ${r.redeemed ? 'text-yellow-400' : 'text-green-400'}`}>{r.redeemed ? 'Redeemed' : 'Active'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}