'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const SLABS = [
  { tier: 'Platinum', min: 90, color: 'text-cyan-400', bg: 'bg-cyan-900' },
  { tier: 'Gold', min: 75, color: 'text-yellow-400', bg: 'bg-yellow-900' },
  { tier: 'Silver', min: 60, color: 'text-gray-300', bg: 'bg-gray-700' },
  { tier: 'Bronze', min: 45, color: 'text-orange-400', bg: 'bg-orange-900' },
  { tier: 'Merit', min: 0, color: 'text-green-400', bg: 'bg-green-900' },
]

function getTier(percentile: number) {
  return SLABS.find(function(s) { return percentile >= s.min }) || SLABS[4]
}

export default function ScholarPage() {
  const [student, setStudent] = useState<any>(null)
  const [score, setScore] = useState('')
  const [total, setTotal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [tier, setTier] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const phone = localStorage.getItem('studentPhone')
    if (!phone) return
    supabase.from('students').select('*').eq('phone', phone).limit(1).then(({ data }) => {
      const s = data?.[0]
      setStudent(s)
      if (s?.score && s?.scholar_tier) {
        setScore(s.score)
        setTier(getTier(Number(s.percentile || 0)))
        setSubmitted(true)
      }
    })
  }, [])

  const handleSubmit = async () => {
    if (!score || !total) { alert('Enter score and total marks'); return }
    setLoading(true)
    const percentile = Math.round((Number(score) / Number(total)) * 100)
    const t = getTier(percentile)
    await supabase.from('students').update({
      score: Number(score),
      total_marks: Number(total),
      percentile,
      scholar_tier: t.tier
    }).eq('id', student.id)
    setTier(t)
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Scholar Program</h1>
      <p className="text-gray-400 text-sm mb-6">Upload your result to get your scholarship tier</p>

      {!submitted ? (
        <div className="bg-[#111827] rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Enter Your Result</h2>
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Your Score</label>
            <input className="w-full bg-[#1f2937] text-white rounded px-3 py-2" value={score} onChange={function(e) { setScore(e.target.value) }} placeholder="e.g. 180" />
          </div>
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Total Marks</label>
            <input className="w-full bg-[#1f2937] text-white rounded px-3 py-2" value={total} onChange={function(e) { setTotal(e.target.value) }} placeholder="e.g. 300" />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
            {loading ? 'Submitting...' : 'Submit Result'}
          </button>
        </div>
      ) : (
        <div className={"rounded-xl p-6 mb-6 text-center " + tier?.bg}>
          <p className="text-sm text-gray-300 mb-1">Your Scholar Tier</p>
          <p className={"text-5xl font-bold mb-2 " + tier?.color}>{tier?.tier}</p>
          <p className="text-gray-300 text-sm">Score: {score} — Percentile: {Math.round((Number(score) / Number(total)) * 100)}%</p>
        </div>
      )}

      <div className="bg-[#111827] rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-4">Tier Breakdown</h2>
        {SLABS.map(function(s) {
          return (
            <div key={s.tier} className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className={"font-semibold " + s.color}>{s.tier}</span>
              <span className="text-gray-400 text-sm">{s.min}%+ percentile</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}