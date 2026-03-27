'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [student, setStudent] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [phone, setPhone] = useState('')
  const [inputPhone, setInputPhone] = useState('')
  const [notFound, setNotFound] = useState(false)

  const loadStudent = async (p: string) => {
    const { data } = await supabase.from('students').select('*').eq('phone', p).limit(1)
    if (data && data.length > 0) {
      setStudent(data[0])
      localStorage.setItem('studentPhone', p)
      supabase.from('deals').select('*').eq('active', true).ilike('city', data[0].city).then(({ data: d }) => setDeals(d || []))
    } else {
      setNotFound(true)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('studentPhone')
    if (saved) { setPhone(saved); loadStudent(saved) }
  }, [])

  const daysToExam = student?.exam_date ? Math.ceil((new Date(student.exam_date).getTime() - Date.now()) / 86400000) : null

  if (!student) return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
      <div className="bg-[#111827] p-8 rounded-xl w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">My Dashboard</h1>
        {notFound && <p className="text-red-400 text-sm mb-3">Phone number not found</p>}
        <input
          className="w-full bg-[#1f2937] text-white rounded px-3 py-2 mb-3"
          placeholder="Enter your phone number"
          value={inputPhone}
          onChange={function(e) { setInputPhone(e.target.value); setNotFound(false) }}
        />
        <button onClick={() => loadStudent(inputPhone)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">View Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {student.name}!</h1>
        <Link href="/profile" className="text-sm text-blue-400 underline">My Profile</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111827] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Verification Status</p>
          {student.is_verified ? <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">✓ Verified</span> : <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full">Pending</span>}
        </div>
        <div className="bg-[#111827] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Exam</p>
          <p className="font-semibold">{student.exam_name}</p>
          <p className="text-xs text-gray-400">{student.exam_date}</p>
        </div>
        <div className="bg-blue-700 rounded-xl p-4 text-center">
          <p className="text-4xl font-bold">{daysToExam ?? '--'}</p>
          <p className="text-sm">Days to Exam</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Available Deals in {student.city} ({deals.length})</h2>
      {deals.map(function(deal) {
        return (
          <div key={deal.id} className="bg-[#111827] rounded-lg p-4 mb-2 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{deal.title}</p>
              <p className="text-gray-400 text-xs">{deal.description}</p>
            </div>
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">{deal.discount_percent}%</span>
          </div>
        )
      })}
      {deals.length === 0 && <p className="text-gray-500 text-sm">No deals in your city yet.</p>}
    </div>
  )
}