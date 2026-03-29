'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'

export default function Dashboard() {
  const [student, setStudent] = useState<Record<string, unknown> | null>(null)
  const [deals, setDeals] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [otpStep, setOtpStep] = useState(false)
  const [inputPhone, setInputPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sendOtpLoading, setSendOtpLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [error, setError] = useState('')

  const loadStudentAndDeals = async () => {
    setLoading(true)
    setError('')
    const { data: row, error: qErr } = await supabase.from('students').select('*').maybeSingle()
    if (qErr || !row) {
      setStudent(null)
      setLoading(false)
      return
    }
    setStudent(row as Record<string, unknown>)
    localStorage.setItem('studentPhone', String(row.phone))
    const city = String(row.city || '')
    const { data: d } = await supabase.from('deals').select('*').eq('active', true).ilike('city', city)
    setDeals((d || []) as Record<string, unknown>[])
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadStudentAndDeals()
      else setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) loadStudentAndDeals()
      else {
        setStudent(null)
        setDeals([])
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const sendLoginOtp = async () => {
    const p = inputPhone.replace(/\D/g, '').slice(-10)
    if (!/^[6-9]\d{9}$/.test(p)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setSendOtpLoading(true)
    setError('')
    try {
      const res = await fetch('/api/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        setSendOtpLoading(false)
        return
      }
      setOtpStep(true)
    } catch {
      setError('Network error')
    } finally {
      setSendOtpLoading(false)
    }
  }

  const verifyLoginOtp = async () => {
    const p = inputPhone.replace(/\D/g, '').slice(-10)
    setVerifyLoading(true)
    setError('')
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, otp: otp.replace(/\D/g, '').slice(0, 6) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Invalid OTP')
        setVerifyLoading(false)
        return
      }
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }
      setOtpStep(false)
      setOtp('')
      await loadStudentAndDeals()
    } catch {
      setError('Network error')
    } finally {
      setVerifyLoading(false)
    }
  }

  const daysToExam =
    student && student.exam_date
      ? Math.ceil((new Date(String(student.exam_date)).getTime() - Date.now()) / 86400000)
      : null

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <Spinner className="size-8 text-blue-400" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <div className="bg-[#111827] p-6 rounded-xl w-full max-w-sm min-w-0">
          <h1 className="text-lg sm:text-xl font-bold mb-2 break-words">My Dashboard</h1>
          <p className="text-gray-400 text-sm mb-4">
            Sign in with the phone number you used to register. We will send a one-time code.
          </p>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          {!otpStep ? (
            <>
              <input
                className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 mb-3 text-base"
                placeholder="10-digit mobile number"
                value={inputPhone}
                onChange={(e) => {
                  setInputPhone(e.target.value)
                  setError('')
                }}
                inputMode="numeric"
                maxLength={15}
              />
              <button
                type="button"
                onClick={sendLoginOtp}
                disabled={sendOtpLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendOtpLoading ? <Spinner className="text-white" /> : null}
                {sendOtpLoading ? 'Sending…' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <input
                className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 mb-3 text-center text-xl tracking-widest"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
              />
              <button
                type="button"
                onClick={verifyLoginOtp}
                disabled={verifyLoading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold mb-2 inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifyLoading ? <Spinner className="text-white" /> : null}
                {verifyLoading ? 'Verifying…' : 'Verify & continue'}
              </button>
              <button
                type="button"
                className="w-full text-sm text-gray-400 underline"
                onClick={() => {
                  setOtpStep(false)
                  setOtp('')
                }}
              >
                Use a different number
              </button>
            </>
          )}
          <p className="text-gray-500 text-xs mt-4">
            New here?{' '}
            <Link href="/register" className="text-blue-400 underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-4xl mx-auto min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold break-words pr-2">
          Welcome, {String(student.name)}!
        </h1>
        <Link href="/profile" className="text-sm text-blue-400 underline shrink-0">
          My Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
        <div className="bg-[#111827] rounded-xl p-4 min-w-0">
          <p className="text-xs text-gray-400 mb-1">Verification Status</p>
          {student.is_verified ? (
            <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">Verified</span>
          ) : (
            <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full">Pending</span>
          )}
        </div>
        <div className="bg-[#111827] rounded-xl p-4 min-w-0">
          <p className="text-xs text-gray-400 mb-1">Exam</p>
          <p className="font-semibold text-sm break-words">{String(student.exam_name)}</p>
          <p className="text-xs text-gray-400">{String(student.exam_date)}</p>
        </div>
        <div className="bg-blue-700 rounded-xl p-4 text-center">
          <p className="text-3xl sm:text-4xl font-bold">{daysToExam ?? '--'}</p>
          <p className="text-sm">Days to Exam</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3 break-words">
        Available Deals in {String(student.city)} ({deals.length})
      </h2>
      {deals.map((deal) => (
        <div
          key={String(deal.id)}
          className="bg-[#111827] rounded-lg p-4 mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 min-w-0"
        >
          <div className="min-w-0">
            <p className="font-medium text-sm break-words">{String(deal.title)}</p>
            <p className="text-gray-400 text-xs break-words">{String(deal.description)}</p>
          </div>
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shrink-0 self-start sm:self-center">
            {String(deal.discount_percent)}%
          </span>
        </div>
      ))}
      {deals.length === 0 && <p className="text-gray-500 text-sm">No deals in your city yet.</p>}
    </div>
  )
}
