'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const cities = ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Jaipur','Lucknow','Chandigarh','Bhopal','Patna','Nagpur','Indore','Vadodara','Coimbatore','Kochi','Visakhapatnam','Agra','Varanasi','Meerut','Ranchi','Guwahati','Dehradun','Allahabad','Jodhpur','Surat','Amritsar','Ludhiana','Kanpur','Nashik','Aurangabad','Rajkot','Madurai','Mysore','Tiruchirappalli','Bhubaneswar','Vijayawada','Jabalpur','Raipur','Gwalior','Thiruvananthapuram','Mangalore','Hubli','Warangal','Guntur','Bhilai','Bikaner','Noida']

const exams = ['JEE Mains','JEE Advanced','NEET UG','NEET PG','UPSC CSE','SSC CGL','SSC CHSL','IBPS PO','IBPS Clerk','SBI PO','RRB NTPC','Other']

export default function Register() {
  const [form, setForm] = useState({ name:'', phone:'', email:'', city:'', exam_name:'', exam_date:'' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(form.phone)) { setError('Enter valid 10-digit mobile number'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.from('students').insert([form])
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-green-400 mb-2">Registration Successful!</h2>
        <p className="text-gray-400">Welcome to ExamGo. Check your deals soon!</p>
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
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  )
}