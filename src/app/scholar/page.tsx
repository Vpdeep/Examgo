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

const INSTITUTES = [
  { name: 'Allen Career Institute', offer: '90% fee waiver', tiers: ['Platinum'], location: 'Kota', phone: '9999900001' },
  { name: 'Aakash Institute', offer: '75% fee waiver', tiers: ['Platinum', 'Gold'], location: 'Delhi', phone: '9999900002' },
  { name: 'FIITJEE', offer: '50% fee waiver', tiers: ['Platinum', 'Gold', 'Silver'], location: 'Pan India', phone: '9999900003' },
  { name: 'Resonance', offer: '40% fee waiver', tiers: ['Gold', 'Silver'], location: 'Kota', phone: '9999900004' },
  { name: 'Vedantu', offer: '30% fee waiver', tiers: ['Silver', 'Bronze'], location: 'Online', phone: '9999900005' },
  { name: 'Unacademy', offer: '25% fee waiver', tiers: ['Bronze', 'Merit'], location: 'Online', phone: '9999900006' },
]

function getTier(percentile: number) {
  return SLABS.find(function(s) { return percentile >= s.min }) || SLABS[4]
}

export default function ScholarPage() {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inputPhone, setInputPhone] = useState('')
  const [score, setScore] = useState('')
  const [total, setTotal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [tier, setTier] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [applyMsg, setApplyMsg] = useState('')

  useEffect(() => {
    const phone = localStorage.getItem('studentPhone')
    if (!phone) { setLoading(false); return }
    supabase.from('students').select('*').eq('phone', phone).limit(1).then(({ data }) => {
      const s = data?.[0]
      setStudent(s)
      if (s?.score && s?.scholar_tier) {
        setScore(String(s.score))
        setTotal(String(s.total_marks || 100))
        setTier(getTier(Number(s.percentile || 0)))
        setSubmitted(true)
      }
      setLoading(false)
    })
    supabase.from('scholar_leads').select('institute_name').eq('student_phone', phone).then(({ data }) => {
      setAppliedIds((data || []).map(function(l: any) { return l.institute_name }))
    })
  }, [])

  const handlePhoneSubmit = () => {
    if (!inputPhone) return
    localStorage.setItem('studentPhone', inputPhone)
    window.location.reload()
  }

  const handleSubmit = async () => {
    if (!score || !total) { alert('Enter score and total marks'); return }
    setSubmitting(true)
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
    setSubmitting(false)
  }

  const handleApply = async (institute: any) => {
    const { error } = await supabase.from('scholar_leads').insert([{
      student_phone: student.phone,
      student_name: student.name,
      student_city: student.city,
      exam_name: student.exam_name,
      scholar_tier: tier.tier,
      institute_name: institute.name,
      institute_phone: institute.phone,
      offer: institute.offer,
    }])
    if (error) { alert('Error: ' + error.message); return }
    setAppliedIds([...appliedIds, institute.name])
    setApplyMsg('Applied to ' + institute.name + '! They will contact you soon.')
  }

  const percentile = total ? Math.round((Number(score) / Number(total)) * 100) : 0

  if (loading) return <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">Loading...</div>

  if (!student) return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">
      <div className="bg-[#111827] p-8 rounded-xl w-full max-w-sm mx-4">
        <h1 className="text-xl font-bold mb-2">Scholar Program</h1>
        <p className="text-gray-400 text-sm mb-4">Enter your registered phone number to continue</p>
        <input
          className="w-full bg-[#1f2937] text-white rounded px-3 py-2 mb-3"
          placeholder="Phone number"
          value={inputPhone}
          onChange={function(e) { setInputPhone(e.target.value) }}
        />
        <button onClick={handlePhoneSubmit} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold mb-3">
          Continue
        </button>
        <p className="text-gray-500 text-xs text-center">Not registered? <a href="/register" className="text-blue-400 underline">Register here</a></p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-2xl mx-auto">
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
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
            {submitting ? 'Submitting...' : 'Submit Result'}
          </button>
        </div>
      ) : (
        <div className={"rounded-xl p-6 mb-6 text-center " + tier?.bg}>
          <p className="text-sm text-gray-300 mb-1">Your Scholar Tier</p>
          <p className={"text-5xl font-bold mb-2 " + tier?.color}>{tier?.tier}</p>
          <p className="text-gray-300 text-sm">Score: {score} — Percentile: {percentile}%</p>
        </div>
      )}

      <div className="bg-[#111827] rounded-xl p-5 mb-6">
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

      {submitted && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Scholarship Offers for You</h2>
          {applyMsg && <p className="text-green-400 text-sm mb-3">{applyMsg}</p>}
          {INSTITUTES.filter(function(o) { return o.tiers.includes(tier?.tier) }).map(function(offer) {
            const applied = appliedIds.includes(offer.name)
            return (
              <div key={offer.name} className="bg-[#111827] rounded-lg p-4 mb-2 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{offer.name}</p>
                  <p className="text-gray-400 text-xs">{offer.location} · {offer.offer}</p>
                </div>
                <button
                  onClick={function() { if (!applied) handleApply(offer) }}
                  className={"text-xs px-3 py-1.5 rounded-full font-semibold " + (applied ? 'bg-green-700 text-white' : 'bg-blue-600 text-white')}
                >
                  {applied ? 'Applied ✓' : 'Apply Now'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}