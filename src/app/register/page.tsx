'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const cities = ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Jaipur','Lucknow','Chandigarh','Bhopal','Patna','Nagpur','Indore','Vadodara','Coimbatore','Kochi','Visakhapatnam','Agra','Varanasi','Meerut','Ranchi','Guwahati','Dehradun','Allahabad','Jodhpur','Surat','Amritsar','Ludhiana','Kanpur','Nashik','Aurangabad','Rajkot','Madurai','Mysore','Tiruchirappalli','Bhubaneswar','Vijayawada','Jabalpur','Raipur','Gwalior','Thiruvananthapuram','Mangalore','Hubli','Warangal','Guntur','Bhilai','Bikaner','Noida']
const exams = ['JEE Mains','JEE Advanced','NEET UG','NEET PG','UPSC CSE','SSC CGL','SSC CHSL','IBPS PO','IBPS Clerk','SBI PO','RRB NTPC','Other']

export default function Register() {
  const [form, setForm] = useState({ name:'', phone:'', email:'', city:'', exam_name:'', exam_date:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form'|'otp'|'upload'|'done'>('form')
  const [studentId, setStudentId] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [file, setFile] = useState<File|null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(form.phone)) { setError('Enter valid 10-digit mobile number'); return }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('students').insert([form]).select().single()
    if (error) { setError(error.message); setLoading(false); return }
    setStudentId(data.id)
    await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: form.phone, student_id: data.id })
    })
    setStep('otp')
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setOtpError('')
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: form.phone, otp, student_id: studentId })
    })
    const data = await res.json()
    if (!res.ok) { setOtpError(data.error); return }
    setStep('upload')
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${studentId}.${ext}`
    const { error: uploadError } = await supabase.storage.from('admit-cards').upload(path, file)
    if (uploadError) { setOtpError(uploadError.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('admit-cards').getPublicUrl(path)
    await supabase.from('students').update({ admit_card_url: urlData.publicUrl }).eq('id', studentId)
    setStep('done')
    setUploading(false)
  }

  if (step === 'done') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-green-400 mb-2">✅ Verification Pending</h2>
        <p className="text-gray-400">Your admit card is under review. You'll get an SMS once verified (usually within 2 hours).</p>
      </div>
    </div>
  )

  if (step === 'upload') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Upload Admit Card</h1>
        <p className="text-gray-400 mb-6">Upload your admit card (JPG, PNG, or PDF, max 5MB)</p>
        {otpError && <p className="text-red-400 mb-4">{otpError}</p>}
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload} disabled={!file || uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg">
          {uploading ? 'Uploading...' : 'Upload & Submit'}
        </button>
      </div>
    </div>
  )

  if (step === 'otp') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Verify Your Number</h1>
        <p className="text-gray-400 mb-6">Enter the 6-digit OTP sent to {form.phone}</p>
        {otpError && <p className="text-red-400 mb-4">{otpError}</p>}
        <input placeholder="Enter OTP" className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 text-center text-2xl tracking-widest" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
        <button onClick={handleVerifyOtp} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg">Verify OTP</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Student Registration</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full Name" className="w-full bg-gray-800 text-white p-3 rounded-lg" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input required placeholder="Mobile Number (10 digits)" className="w-full bg-gray-800 text-white p-3 rounded-lg" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} maxLength={10} />
          <input required type="email" placeholder="Email" className="w-full bg-gray-800 text-white p-3 rounded-lg" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <select required className="w-full bg-gray-800 text-white p-3 rounded-lg" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
            <option value="">Select City</option>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
          <select required className="w-full bg-gray-800 text-white p-3 rounded-lg" value={form.exam_name} onChange={e => setForm({...form, exam_name: e.target.value})}>
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e}>{e}</option>)}
          </select>
          <input required type="date" className="w-full bg-gray-800 text-white p-3 rounded-lg" value={form.exam_date} onChange={e => setForm({...form, exam_date: e.target.value})} />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg">
            {loading ? 'Sending OTP...' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  )
}