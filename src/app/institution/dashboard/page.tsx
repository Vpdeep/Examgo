'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { scholarshipFormSchema } from '@/lib/validation'
import { Spinner } from '@/components/ui/spinner'

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')

export default function InstitutionDashboard() {
  const [phone, setPhone] = useState('')
  const [authed, setAuthed] = useState(false)
  const [institution, setInstitution] = useState<Record<string, unknown> | null>(null)
  const [scholarships, setScholarships] = useState<Record<string, unknown>[]>([])
  const [applications, setApplications] = useState<Record<string, unknown>[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Coaching',
    stream: 'Any',
    min_tier: 'Merit',
    value: '',
    deadline: '',
    contact_email: '',
    apply_url: '',
  })
  const [loginLoading, setLoginLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [formError, setFormError] = useState('')

  const handleLogin = async () => {
    setLoginError('')
    const p = phone.replace(/\D/g, '').slice(-10)
    const parsed = phoneSchema.safeParse(p)
    if (!parsed.success) {
      setLoginError(parsed.error.issues.map((i) => i.message).join(', '))
      return
    }
    setLoginLoading(true)
    const { data } = await supabase.from('institutions').select('*').eq('phone', parsed.data).limit(1)
    if (data && data.length > 0) {
      setInstitution(data[0] as Record<string, unknown>)
      setAuthed(true)
      supabase
        .from('scholarships')
        .select('*')
        .eq('institution_id', data[0].id as string)
        .then(({ data: s }) => setScholarships((s || []) as Record<string, unknown>[]))
      supabase
        .from('scholar_leads')
        .select('*')
        .eq('institute_phone', parsed.data)
        .then(({ data: a }) => setApplications((a || []) as Record<string, unknown>[]))
    } else {
      await supabase.from('institutions').insert([{ phone: parsed.data, name: 'New Institution' }])
      const { data: newInst } = await supabase.from('institutions').select('*').eq('phone', parsed.data).limit(1)
      const row = (newInst?.[0] || { phone: parsed.data, name: 'New Institution' }) as Record<string, unknown>
      setInstitution(row)
      setAuthed(true)
    }
    setLoginLoading(false)
  }

  const handleAddScholarship = async () => {
    setFormError('')
    const parsed = scholarshipFormSchema.safeParse(form)
    if (!parsed.success) {
      setFormError(parsed.error.issues.map((i) => i.message).join(', '))
      return
    }
    if (!institution?.id) return
    setSaveLoading(true)
    const { error } = await supabase.from('scholarships').insert([
      {
        ...parsed.data,
        institution_id: institution.id,
        institution_name: institution.name,
      },
    ])
    setSaveLoading(false)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    setShowForm(false)
    supabase
      .from('scholarships')
      .select('*')
      .eq('institution_id', institution.id as string)
      .then(({ data: s }) => setScholarships((s || []) as Record<string, unknown>[]))
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <div className="bg-[#111827] p-6 sm:p-8 rounded-xl w-full max-w-sm min-w-0">
          <h1 className="text-lg sm:text-xl font-bold mb-2">Institution Portal</h1>
          <p className="text-gray-400 text-sm mb-4">Login with your registered phone number</p>
          {loginError && <p className="text-red-400 text-sm mb-3">{loginError}</p>}
          <input
            className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 mb-3 text-base"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            maxLength={10}
          />
          <button
            type="button"
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loginLoading ? <Spinner className="text-white" /> : null}
            {loginLoading ? 'Please wait…' : 'Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-3xl mx-auto min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-1 break-words">{String(institution?.name)}</h1>
      <p className="text-gray-400 text-sm mb-6">Institution Partner Portal</p>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-blue-400">{scholarships.length}</p>
          <p className="text-gray-400 text-xs sm:text-sm">Scholarships Listed</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-green-400">{applications.length}</p>
          <p className="text-gray-400 text-xs sm:text-sm">Applications Received</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold">Your Scholarships</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg w-full sm:w-auto"
        >
          + Add Scholarship
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111827] rounded-xl p-4 mb-4 space-y-3 min-w-0">
          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          {[
            { key: 'title' as const, label: 'Scholarship Title' },
            { key: 'description' as const, label: 'Description' },
            { key: 'value' as const, label: 'Value (e.g. 50% fee waiver)' },
            { key: 'deadline' as const, label: 'Deadline (YYYY-MM-DD)' },
            { key: 'contact_email' as const, label: 'Contact Email' },
            { key: 'apply_url' as const, label: 'Apply URL (optional)' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input
                className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Minimum Tier Required</label>
            <select
              className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
              value={form.min_tier}
              onChange={(e) => setForm({ ...form, min_tier: e.target.value })}
            >
              <option value="Merit">Merit</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stream</label>
            <select
              className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
              value={form.stream}
              onChange={(e) => setForm({ ...form, stream: e.target.value })}
            >
              <option value="Any">Any</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Civil Services">Civil Services</option>
              <option value="Banking">Banking</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddScholarship}
            disabled={saveLoading}
            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saveLoading ? <Spinner className="text-white" /> : null}
            {saveLoading ? 'Saving…' : 'Save Scholarship'}
          </button>
        </div>
      )}

      {scholarships.map((s) => (
        <div key={String(s.id)} className="bg-[#111827] rounded-lg p-4 mb-2 min-w-0">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <p className="font-medium text-sm break-words">{String(s.title)}</p>
            <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full shrink-0">
              {String(s.min_tier)}+
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1 break-words">
            {String(s.value)} · Deadline: {String(s.deadline)}
          </p>
        </div>
      ))}

      {applications.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Applications Received</h2>
          {applications.map((a) => (
            <div key={String(a.id)} className="bg-[#111827] rounded-lg p-3 mb-2 text-sm min-w-0">
              <p className="font-medium break-words">
                {String(a.student_name)} — {String(a.scholar_tier)}
              </p>
              <p className="text-gray-400 text-xs break-words">
                {String(a.exam_name)} · {String(a.student_city)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
