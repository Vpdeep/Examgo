'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ALLOWED_CITIES, ALLOWED_EXAMS, studentRegisterSchema } from '@/lib/validation'
import { Spinner } from '@/components/ui/spinner'

const cities = [...ALLOWED_CITIES]
const exams = [...ALLOWED_EXAMS]

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', exam_name: '', exam_date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'otp' | 'upload' | 'done'>('form')
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors(null)

    const parsed = studentRegisterSchema.safeParse(form)
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Registration failed')
        setLoading(false)
        return
      }
      const otpRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: parsed.data.phone, student_id: data.id }),
      })
      const otpJson = await otpRes.json()
      if (!otpRes.ok) {
        setError(otpJson.error || 'Failed to send OTP')
        setLoading(false)
        return
      }
      setStep('otp')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setOtpError('')
    setOtpLoading(true)
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp: otp.replace(/\D/g, '').slice(0, 6) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(typeof data.error === 'string' ? data.error : 'Verification failed')
        setOtpLoading(false)
        return
      }
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }
      setStep('upload')
    } catch {
      setOtpError('Network error')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setOtpError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setOtpError('Session expired. Start again from OTP.')
        setUploading(false)
        return
      }
      const fd = new FormData()
      fd.set('file', file)
      const res = await fetch('/api/students/upload-admit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error || 'Upload failed')
        setUploading(false)
        return
      }
      setStep('done')
    } catch {
      setOtpError('Network error')
    } finally {
      setUploading(false)
    }
  }

  const otpErrMsg = otpError

  if (step === 'done')
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-400 mb-2">Verification Pending</h2>
          <p className="text-gray-400 text-sm">
            Your admit card is under review. You will get an SMS once verified (usually within 2 hours).
          </p>
        </div>
      </div>
    )

  if (step === 'upload')
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 p-6 sm:p-8 rounded-xl w-full max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Upload Admit Card</h1>
          <p className="text-gray-400 text-sm mb-6">JPG, PNG, or PDF, max 5MB</p>
          {otpErrMsg && <p className="text-red-400 text-sm mb-4">{otpErrMsg}</p>}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 text-sm"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold p-3 rounded-lg inline-flex items-center justify-center gap-2"
          >
            {uploading ? <Spinner className="text-white" /> : null}
            {uploading ? 'Uploading…' : 'Upload & Submit'}
          </button>
        </div>
      </div>
    )

  if (step === 'otp')
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 p-6 sm:p-8 rounded-xl w-full max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Verify Your Number</h1>
          <p className="text-gray-400 text-sm mb-6">Enter the 6-digit OTP sent to {form.phone}</p>
          {otpErrMsg && <p className="text-red-400 text-sm mb-4">{otpErrMsg}</p>}
          <input
            placeholder="Enter OTP"
            inputMode="numeric"
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 text-center text-xl sm:text-2xl tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {otpLoading ? <Spinner className="text-white" /> : null}
            {otpLoading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 sm:p-8 rounded-xl w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">Student Registration</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full Name"
            className="w-full bg-gray-800 text-white p-3 rounded-lg text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {fieldErrors?.name && <p className="text-red-400 text-xs">{fieldErrors.name.join(', ')}</p>}
          <input
            required
            placeholder="Mobile Number (10 digits)"
            className="w-full bg-gray-800 text-white p-3 rounded-lg text-sm"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            maxLength={10}
            inputMode="numeric"
          />
          {fieldErrors?.phone && <p className="text-red-400 text-xs">{fieldErrors.phone.join(', ')}</p>}
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full bg-gray-800 text-white p-3 rounded-lg text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {fieldErrors?.email && <p className="text-red-400 text-xs">{fieldErrors.email.join(', ')}</p>}
          <select
            required
            className="w-full bg-gray-800 text-white p-3 rounded-lg text-sm"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {fieldErrors?.city && <p className="text-red-400 text-xs">{fieldErrors.city.join(', ')}</p>}
          <select
            required
            className="w-full bg-gray-800 text-white p-3 rounded-lg text-sm"
            value={form.exam_name}
            onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
          >
            <option value="">Select Exam</option>
            {exams.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
          {fieldErrors?.exam_name && <p className="text-red-400 text-xs">{fieldErrors.exam_name.join(', ')}</p>}
          <input
            required
            type="date"
            className="w-full bg-gray-800 text-white p-3 rounded-lg text-sm"
            value={form.exam_date}
            onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
          />
          {fieldErrors?.exam_date && <p className="text-red-400 text-xs">{fieldErrors.exam_date.join(', ')}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Spinner className="text-white" /> : null}
            {loading ? 'Sending OTP…' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  )
}
