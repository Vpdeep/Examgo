'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { citySchema, examSchema, sanitizeText } from '@/lib/validation'
import { Spinner } from '@/components/ui/spinner'

export default function ProfilePage() {
  const [student, setStudent] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [city, setCity] = useState('')
  const [examName, setExamName] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setStudent(null)
      setLoading(false)
      return
    }
    const { data: s, error } = await supabase.from('students').select('*').maybeSingle()
    if (error || !s) {
      setStudent(null)
      setLoading(false)
      return
    }
    setStudent(s as Record<string, unknown>)
    localStorage.setItem('studentPhone', String(s.phone))
    setCity(String(s.city || ''))
    setExamName(String(s.exam_name || ''))
    setLoading(false)
  }

  useEffect(() => {
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load()
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSave = async () => {
    setSaveError('')
    const cityParsed = citySchema.safeParse(city)
    const examParsed = examSchema.safeParse(examName)
    if (!cityParsed.success) {
      setSaveError(cityParsed.error.issues.map((e) => e.message).join(', ') || 'Invalid city')
      return
    }
    if (!examParsed.success) {
      setSaveError(examParsed.error.issues.map((e) => e.message).join(', ') || 'Invalid exam')
      return
    }
    if (!student?.id) return
    setSaveLoading(true)
    try {
      const { error } = await supabase
        .from('students')
        .update({ city: cityParsed.data, exam_name: examParsed.data })
        .eq('id', student.id as string)
      if (error) {
        setSaveError(error.message)
        setSaveLoading(false)
        return
      }
      setStudent({ ...student, city: cityParsed.data, exam_name: examParsed.data })
      setEditing(false)
    } finally {
      setSaveLoading(false)
    }
  }

  const steps = [
    { label: 'Registration', done: true },
    { label: 'Phone Verified', done: !!(student as { phone_verified?: boolean })?.phone_verified },
    { label: 'Admit Card Uploaded', done: !!(student as { admit_card_url?: string })?.admit_card_url },
    { label: 'Verified', done: !!student?.is_verified },
    { label: 'Exam Day', done: false },
    { label: 'Result Uploaded', done: !!(student as { score?: unknown })?.score },
    {
      label: 'Scholar Tier Assigned',
      done: !!(student as { scholar_tier?: string })?.scholar_tier,
    },
  ]

  const currentStep = steps.filter((s) => s.done).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <Spinner className="size-8 text-blue-400" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4 text-center">
        <p>
          Sign in from the dashboard.{' '}
          <Link href="/dashboard" className="underline text-blue-400">
            Go to dashboard
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
        <Link href="/dashboard" className="text-sm text-blue-400 underline shrink-0">
          ← Dashboard
        </Link>
      </div>

      <div className="bg-[#111827] rounded-xl p-5 mb-6 space-y-3 min-w-0">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg font-semibold break-words">{String(student.name)}</h2>
          {Boolean(student.is_verified) && (
            <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shrink-0">Verified</span>
          )}
        </div>
        <p className="text-gray-400 text-sm break-all">📞 {String(student.phone)}</p>
        <p className="text-gray-400 text-sm break-all">✉️ {String(student.email)}</p>
        {editing ? (
          <div className="space-y-2 pt-2">
            {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
            <input
              className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
              value={city}
              onChange={(e) => setCity(sanitizeText(e.target.value, 80))}
              placeholder="City (must match list)"
            />
            <input
              className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
              value={examName}
              onChange={(e) => setExamName(sanitizeText(e.target.value, 120))}
              placeholder="Exam name (must match list)"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="bg-blue-600 px-4 py-1.5 rounded text-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                {saveLoading ? <Spinner className="text-white" /> : null}
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setCity(String(student.city || ''))
                  setExamName(String(student.exam_name || ''))
                  setSaveError('')
                }}
                className="bg-gray-600 px-4 py-1.5 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pt-1 min-w-0">
            <div className="min-w-0">
              <p className="text-gray-400 text-sm break-words">🏙️ {String(student.city)}</p>
              <p className="text-gray-400 text-sm break-words">
                📝 {String(student.exam_name)} — {String(student.exam_date)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-blue-400 underline shrink-0"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#111827] rounded-xl p-5 mb-6 min-w-0">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">Scholar Status</h3>
        {student.scholar_tier ? (
          <div
            className={
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ' +
              (student.scholar_tier === 'Platinum'
                ? 'bg-cyan-900 text-cyan-300'
                : student.scholar_tier === 'Gold'
                  ? 'bg-yellow-900 text-yellow-300'
                  : student.scholar_tier === 'Silver'
                    ? 'bg-gray-700 text-gray-200'
                    : student.scholar_tier === 'Bronze'
                      ? 'bg-orange-900 text-orange-300'
                      : 'bg-green-900 text-green-300')
            }
          >
            ★ {String(student.scholar_tier)}
          </div>
        ) : student.score ? (
          <p className="text-yellow-400 text-sm">
            Result under review — your scholar tier will be assigned within 24 hrs.
          </p>
        ) : (
          <p className="text-gray-500 text-sm">
            Upload your result to unlock scholarships —{' '}
            <Link href="/scholar" className="text-blue-400 underline">
              Go to Scholar
            </Link>
          </p>
        )}
      </div>

      <div className="bg-[#111827] rounded-xl p-5 min-w-0">
        <h3 className="text-sm font-semibold mb-4 text-gray-300">Your Journey</h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 min-w-0">
              <div
                className={
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ' +
                  (i < currentStep ? 'bg-green-600' : i === currentStep ? 'bg-blue-600' : 'bg-gray-700')
                }
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span
                className={
                  'text-sm break-words ' +
                  (i < currentStep ? 'text-green-400' : i === currentStep ? 'text-white font-semibold' : 'text-gray-500')
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
