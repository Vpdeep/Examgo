'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [city, setCity] = useState('')
  const [examName, setExamName] = useState('')

  useEffect(() => {
    const phone = localStorage.getItem('studentPhone')
    if (!phone) { setLoading(false); return }
    supabase.from('students').select('*').eq('phone', phone).limit(1).then(({ data }) => {
      const s = data?.[0] || null
      setStudent(s)
      setCity(s?.city || '')
      setExamName(s?.exam_name || '')
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    await supabase.from('students').update({ city, exam_name: examName }).eq('id', student.id)
    setStudent({ ...student, city, exam_name: examName })
    setEditing(false)
  }

  const steps = [
    { label: 'Registration', done: true },
    { label: 'Phone Verified', done: !!student?.phone },
    { label: 'Admit Card Uploaded', done: !!student?.admit_card_url },
    { label: 'Verified', done: !!student?.is_verified },
    { label: 'Exam Day', done: false },
    { label: 'Result Uploaded', done: false },
    { label: 'Scholar Tier Assigned', done: false },
  ]

  const currentStep = steps.filter(function(s) { return s.done }).length

  if (loading) return <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">Loading...</div>
  if (!student) return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
      No student found. <Link href="/dashboard" className="ml-2 underline text-blue-400">Go back</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Link href="/dashboard" className="text-sm text-blue-400 underline">← Dashboard</Link>
      </div>

      <div className="bg-[#111827] rounded-xl p-5 mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{student.name}</h2>
          {student.is_verified && <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">✓ Verified</span>}
        </div>
        <p className="text-gray-400 text-sm">📞 {student.phone}</p>
        <p className="text-gray-400 text-sm">✉️ {student.email}</p>

        {editing ? (
          <div className="space-y-2 pt-2">
            <input className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm" value={city} onChange={function(e) { setCity(e.target.value) }} placeholder="City" />
            <input className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm" value={examName} onChange={function(e) { setExamName(e.target.value) }} placeholder="Exam Name" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-blue-600 px-4 py-1.5 rounded text-sm">Save</button>
              <button onClick={() => setEditing(false)} className="bg-gray-600 px-4 py-1.5 rounded text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-1">
            <div>
              <p className="text-gray-400 text-sm">🏙️ {student.city}</p>
              <p className="text-gray-400 text-sm">📝 {student.exam_name} — {student.exam_date}</p>
            </div>
            <button onClick={() => setEditing(true)} className="text-xs text-blue-400 underline">Edit</button>
          </div>
        )}
      </div>

      <div className="bg-[#111827] rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-gray-300">Your Journey</h3>
        <div className="space-y-3">
          {steps.map(function(step, i) {
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 " + (i < currentStep ? 'bg-green-600' : i === currentStep ? 'bg-blue-600' : 'bg-gray-700')}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={"text-sm " + (i < currentStep ? 'text-green-400' : i === currentStep ? 'text-white font-semibold' : 'text-gray-500')}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}