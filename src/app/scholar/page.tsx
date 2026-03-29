'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'

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
  return SLABS.find((s) => percentile >= s.min) || SLABS[4]
}

export default function ScholarPage() {
  const [student, setStudent] = useState<Record<string, unknown> | null>(null)
  const [score, setScore] = useState('')
  const [total, setTotal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [tier, setTier] = useState<(typeof SLABS)[0] | null>(null)
  const [loading, setLoading] = useState(false)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [applyMsg, setApplyMsg] = useState('')
  const [applyLoading, setApplyLoading] = useState<string | null>(null)
  const [bootLoading, setBootLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setBootLoading(false)
        return
      }
      const { data: s } = await supabase.from('students').select('*').maybeSingle()
      if (s) {
        setStudent(s as Record<string, unknown>)
        localStorage.setItem('studentPhone', String(s.phone))
        if (s.score && s.scholar_tier) {
          setScore(String(s.score))
          setTotal(String(s.total_marks || 100))
          setTier(getTier(Number(s.percentile || 0)))
          setSubmitted(true)
        }
        const { data: leads } = await supabase
          .from('scholar_leads')
          .select('institute_name')
          .eq('student_phone', s.phone)
        setAppliedIds((leads || []).map((l: { institute_name: string }) => l.institute_name))
      }
      setBootLoading(false)
    }
    run()
  }, [])

  const handleSubmit = async () => {
    const sc = Number(score)
    const tot = Number(total)
    if (!Number.isFinite(sc) || !Number.isFinite(tot) || tot <= 0 || sc < 0 || sc > tot) {
      alert('Enter valid score and total marks')
      return
    }
    if (!student?.id) return
    setLoading(true)
    const percentile = Math.round((sc / tot) * 100)
    const t = getTier(percentile)
    await supabase
      .from('students')
      .update({
        score: sc,
        total_marks: tot,
        percentile,
        scholar_tier: t.tier,
      })
      .eq('id', student.id as string)
    setTier(t)
    setSubmitted(true)
    setLoading(false)
  }

  const handleApply = async (institute: (typeof INSTITUTES)[0]) => {
    if (!student?.phone) return
    setApplyLoading(institute.name)
    setApplyMsg('')
    const { error } = await supabase.from('scholar_leads').insert([
      {
        student_phone: student.phone,
        student_name: student.name,
        student_city: student.city,
        exam_name: student.exam_name,
        scholar_tier: tier?.tier,
        institute_name: institute.name,
        institute_phone: institute.phone,
        offer: institute.offer,
      },
    ])
    setApplyLoading(null)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    setAppliedIds([...appliedIds, institute.name])
    setApplyMsg('Applied to ' + institute.name + '! They will contact you soon.')
  }

  const percentile = total ? Math.round((Number(score) / Number(total)) * 100) : 0

  if (bootLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <Spinner className="size-8 text-blue-400" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-2xl mx-auto">
        <p className="text-gray-400">Sign in from the dashboard to use the Scholar program.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Scholar Program</h1>
      <p className="text-gray-400 text-sm mb-6">Upload your result to get your scholarship tier</p>

      {!submitted ? (
        <div className="bg-[#111827] rounded-xl p-5 mb-6 min-w-0">
          <h2 className="text-lg font-semibold mb-4">Enter Your Result</h2>
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Your Score</label>
            <input
              className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-base"
              value={score}
              onChange={(e) => setScore(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="e.g. 180"
              inputMode="decimal"
            />
          </div>
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Total Marks</label>
            <input
              className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-base"
              value={total}
              onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="e.g. 300"
              inputMode="decimal"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Spinner className="text-white" /> : null}
            {loading ? 'Submitting…' : 'Submit Result'}
          </button>
        </div>
      ) : (
        <div className={'rounded-xl p-6 mb-6 text-center min-w-0 ' + (tier?.bg || '')}>
          <p className="text-sm text-gray-300 mb-1">Your Scholar Tier</p>
          <p className={'text-4xl sm:text-5xl font-bold mb-2 break-words ' + (tier?.color || '')}>{tier?.tier}</p>
          <p className="text-gray-300 text-sm">
            Score: {score} — Percentile: {percentile}%
          </p>
        </div>
      )}

      <div className="bg-[#111827] rounded-xl p-5 mb-6 min-w-0">
        <h2 className="text-lg font-semibold mb-4">Tier Breakdown</h2>
        {SLABS.map((s) => (
          <div key={s.tier} className="flex justify-between items-center py-2 border-b border-gray-800 gap-2 min-w-0">
            <span className={'font-semibold shrink-0 ' + s.color}>{s.tier}</span>
            <span className="text-gray-400 text-sm text-right">{s.min}%+ percentile</span>
          </div>
        ))}
      </div>

      {submitted && (
        <div className="min-w-0">
          <h2 className="text-lg font-semibold mb-4">Scholarship Offers for You</h2>
          {applyMsg && <p className="text-green-400 text-sm mb-3 break-words">{applyMsg}</p>}
          {INSTITUTES.filter((o) => o.tiers.includes(tier?.tier || '')).map((offer) => {
            const applied = appliedIds.includes(offer.name)
            const busy = applyLoading === offer.name
            return (
              <div
                key={offer.name}
                className="bg-[#111827] rounded-lg p-4 mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 min-w-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm break-words">{offer.name}</p>
                  <p className="text-gray-400 text-xs break-words">
                    {offer.location} · {offer.offer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!applied && !busy) handleApply(offer)
                  }}
                  disabled={applied || busy}
                  className={
                    'text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 inline-flex items-center justify-center gap-2 min-h-[36px] ' +
                    (applied ? 'bg-green-700 text-white' : 'bg-blue-600 text-white disabled:opacity-50')
                  }
                >
                  {busy ? <Spinner className="text-white size-3" /> : null}
                  {applied ? 'Applied ✓' : busy ? 'Applying…' : 'Apply Now'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
