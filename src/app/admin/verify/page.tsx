'use client'
import { useCallback, useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

type Row = Record<string, unknown>

export default function AdminVerify() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [students, setStudents] = useState<Row[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [actionKey, setActionKey] = useState<string | null>(null)

  const loadStudents = useCallback(async () => {
    setDataLoading(true)
    try {
      const res = await fetch('/api/admin/data?resource=students', { credentials: 'include' })
      const j = await res.json()
      if (j.data) setStudents(j.data as Row[])
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) loadStudents()
  }, [authed, loadStudents])

  const tryLogin = async () => {
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setLoginError((j as { error?: string }).error || 'Unauthorized')
        setLoginLoading(false)
        return
      }
      setPass('')
      setAuthed(true)
    } catch {
      setLoginError('Network error')
    } finally {
      setLoginLoading(false)
    }
  }

  const counts = {
    pending: students.filter((s) => !Boolean(s.is_verified) && Boolean(s.admit_card_url)).length,
    approved: students.filter((s) => Boolean(s.is_verified)).length,
    rejected: students.filter((s) => !Boolean(s.is_verified) && !Boolean(s.admit_card_url)).length,
  }

  const approve = async (id: string, phone: string) => {
    setActionKey(`ap-${id}`)
    try {
      await fetch('/api/admin/mutate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'student_verify', id, is_verified: true }),
      })
      await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, student_id: id }),
      })
      await loadStudents()
    } finally {
      setActionKey(null)
    }
  }

  const reject = async (id: string) => {
    setActionKey(`rj-${id}`)
    try {
      await fetch('/api/admin/mutate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'student_verify', id, is_verified: false }),
      })
      await loadStudents()
    } finally {
      setActionKey(null)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 p-6 sm:p-8 rounded-xl w-full max-w-sm min-w-0">
          <h1 className="text-xl font-bold text-white mb-6">Admin Login</h1>
          {loginError && <p className="text-red-400 text-sm mb-3">{loginError}</p>}
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 text-base"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            type="button"
            onClick={tryLogin}
            disabled={loginLoading}
            className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loginLoading ? <Spinner className="text-white" /> : null}
            {loginLoading ? 'Signing in…' : 'Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 min-w-0 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Verification Dashboard</h1>
        {dataLoading && (
          <span className="text-gray-400 text-sm inline-flex items-center gap-2">
            <Spinner className="size-4 text-gray-400" /> Loading…
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
        <div className="bg-yellow-900 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-yellow-400">{counts.pending}</p>
          <p className="text-yellow-200 text-sm">Pending</p>
        </div>
        <div className="bg-green-900 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-400">{counts.approved}</p>
          <p className="text-green-200 text-sm">Approved</p>
        </div>
        <div className="bg-red-900 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-red-400">{counts.rejected}</p>
          <p className="text-red-200 text-sm">Rejected</p>
        </div>
      </div>
      <div className="space-y-4">
        {students.map((s) => (
          <div
            key={String(s.id)}
            className="bg-gray-900 p-4 rounded-xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0"
          >
            <div className="min-w-0">
              <p className="text-white font-bold break-words">{String(s.name)}</p>
              <p className="text-gray-400 text-sm break-words">
                {String(s.phone)} · {String(s.exam_name)} · {String(s.city)}
              </p>
              <p className="text-gray-400 text-sm">{String(s.exam_date)}</p>
              {Boolean(s.admit_card_url) ? (
                <a href={String(s.admit_card_url)} target="_blank" rel="noreferrer" className="text-blue-400 text-sm underline">
                  View Admit Card
                </a>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 items-center shrink-0">
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${s.is_verified ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}
              >
                {s.is_verified ? 'Approved' : 'Pending'}
              </span>
              {!Boolean(s.is_verified) && (
                <button
                  type="button"
                  disabled={actionKey === `ap-${s.id}`}
                  onClick={() => approve(String(s.id), String(s.phone))}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {actionKey === `ap-${s.id}` ? <Spinner className="size-3 text-white" /> : null}
                  Approve
                </button>
              )}
              <button
                type="button"
                disabled={actionKey === `rj-${s.id}`}
                onClick={() => reject(String(s.id))}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm inline-flex items-center gap-1 disabled:opacity-50"
              >
                {actionKey === `rj-${s.id}` ? <Spinner className="size-3 text-white" /> : null}
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
