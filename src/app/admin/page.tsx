'use client'
import { useCallback, useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

type Row = Record<string, unknown>

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState('stats')
  const [students, setStudents] = useState<Row[]>([])
  const [merchants, setMerchants] = useState<Row[]>([])
  const [deals, setDeals] = useState<Row[]>([])
  const [redemptions, setRedemptions] = useState<Row[]>([])
  const [scholarLeads, setScholarLeads] = useState<Row[]>([])
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastCity, setBroadcastCity] = useState('')
  const [broadcastExam, setBroadcastExam] = useState('')
  const [broadcastResult, setBroadcastResult] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [broadcastLoading, setBroadcastLoading] = useState(false)
  const [mutateKey, setMutateKey] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setDataLoading(true)
    try {
      const [st, m, d, r, sl] = await Promise.all([
        fetch('/api/admin/data?resource=students', { credentials: 'include' }).then((x) => x.json()),
        fetch('/api/admin/data?resource=merchants', { credentials: 'include' }).then((x) => x.json()),
        fetch('/api/admin/data?resource=deals', { credentials: 'include' }).then((x) => x.json()),
        fetch('/api/admin/data?resource=redemptions', { credentials: 'include' }).then((x) => x.json()),
        fetch('/api/admin/data?resource=scholar_leads', { credentials: 'include' }).then((x) => x.json()),
      ])
      if (st.data) setStudents(st.data as Row[])
      if (m.data) setMerchants(m.data as Row[])
      if (d.data) setDeals(d.data as Row[])
      if (r.data) setRedemptions(r.data as Row[])
      if (sl.data) setScholarLeads(sl.data as Row[])
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    loadAll()
  }, [authed, loadAll])

  const tryLogin = async () => {
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setLoginError((j as { error?: string }).error || 'Wrong password')
        setLoginLoading(false)
        return
      }
      setPassword('')
      setAuthed(true)
    } catch {
      setLoginError('Network error')
    } finally {
      setLoginLoading(false)
    }
  }

  const mutate = async (
    body:
      | { op: 'student_verify'; id: string; is_verified: boolean }
      | { op: 'merchant_verify'; id: string; verified: boolean }
      | { op: 'deal_active'; id: string; active: boolean },
    key: string
  ) => {
    setMutateKey(key)
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) await loadAll()
    } finally {
      setMutateKey(null)
    }
  }

  const exportCSV = (data: Row[], filename: string) => {
    if (!data.length) {
      alert('No data to export')
      return
    }
    const keys = Object.keys(data[0])
    const csv = [
      keys.join(','),
      ...data.map((row) => keys.map((k) => String(row[k] ?? '')).join(',')),
    ].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = filename
    a.click()
  }

  const handleBroadcast = async () => {
    setBroadcastLoading(true)
    await new Promise((r) => setTimeout(r, 100))
    let targets = students
    if (broadcastCity.trim()) {
      targets = targets.filter((s) => String(s.city || '').toLowerCase() === broadcastCity.trim().toLowerCase())
    }
    if (broadcastExam.trim()) {
      const ex = broadcastExam.trim().toLowerCase()
      targets = targets.filter((s) => String(s.exam_name || '').toLowerCase().includes(ex))
    }
    const phones = targets.map((s) => String(s.phone || '')).join(', ')
    setBroadcastResult(
      'Message ready for ' + targets.length + ' students.\nPhones: ' + phones + '\n\nMessage: ' + broadcastMsg
    )
    setBroadcastLoading(false)
  }

  const todayRedemptions = redemptions.filter((r) => {
    return new Date(String(r.created_at)).toDateString() === new Date().toDateString()
  }).length

  const weekRedemptions = redemptions.filter((r) => {
    return Date.now() - new Date(String(r.created_at)).getTime() < 7 * 86400000
  }).length

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <div className="bg-[#111827] p-6 sm:p-8 rounded-xl w-full max-w-sm min-w-0">
          <h1 className="text-lg sm:text-xl font-bold mb-4">Admin Login</h1>
          {loginError && <p className="text-red-400 text-sm mb-3">{loginError}</p>}
          <input
            type="password"
            className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 mb-3 text-base"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={tryLogin}
            disabled={loginLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loginLoading ? <Spinner className="text-white" /> : null}
            {loginLoading ? 'Signing in…' : 'Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-5xl mx-auto min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
        <div className="flex flex-wrap items-center gap-2">
          {dataLoading && (
            <span className="text-gray-500 text-sm inline-flex items-center gap-1">
              <Spinner className="size-4 text-gray-400" /> Refreshing…
            </span>
          )}
          <button
            type="button"
            className="text-sm text-gray-400 underline"
            onClick={async () => {
              await fetch('/api/admin/session', { method: 'DELETE', credentials: 'include' })
              setAuthed(false)
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['stats', 'students', 'merchants', 'deals', 'scholar', 'broadcast'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize ' +
              (tab === t ? 'bg-blue-600' : 'bg-[#111827]')
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
          {[
            { label: 'Total Students', value: students.length, color: 'text-blue-400' },
            { label: 'Verified Students', value: students.filter((s) => Boolean(s.is_verified)).length, color: 'text-green-400' },
            { label: 'Total Merchants', value: merchants.length, color: 'text-yellow-400' },
            { label: 'Total Redemptions', value: redemptions.length, color: 'text-purple-400' },
            { label: 'Redemptions Today', value: todayRedemptions, color: 'text-pink-400' },
            { label: 'Redemptions This Week', value: weekRedemptions, color: 'text-orange-400' },
            { label: 'Active Deals', value: deals.filter((d) => Boolean(d.active)).length, color: 'text-cyan-400' },
            { label: 'Scholar Leads', value: scholarLeads.length, color: 'text-indigo-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111827] rounded-xl p-4 text-center">
              <p className={'text-2xl sm:text-3xl font-bold ' + stat.color}>{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'students' && (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-3">
            <h2 className="text-lg font-semibold">Students ({students.length})</h2>
            <button
              type="button"
              onClick={() => exportCSV(students, 'students.csv')}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg w-full sm:w-auto"
            >
              Export CSV
            </button>
          </div>
          {students.map((s) => (
            <div
              key={String(s.id)}
              className="bg-[#111827] rounded-lg p-4 mb-2 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm break-words">
                  {String(s.name)} — {String(s.phone)}
                </p>
                <p className="text-gray-400 text-xs break-words">
                  {String(s.city)} · {String(s.exam_name)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={
                    'text-xs px-2 py-1 rounded-full ' + (s.is_verified ? 'bg-green-700' : 'bg-yellow-700')
                  }
                >
                  {s.is_verified ? 'Verified' : 'Pending'}
                </span>
                {!Boolean(s.is_verified) && (
                  <button
                    type="button"
                    disabled={mutateKey === `sv-${s.id}-1`}
                    onClick={() => mutate({ op: 'student_verify', id: String(s.id), is_verified: true }, `sv-${s.id}-1`)}
                    className="bg-green-600 text-white text-xs px-3 py-1 rounded inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {mutateKey === `sv-${s.id}-1` ? <Spinner className="size-3 text-white" /> : null}
                    Approve
                  </button>
                )}
                {Boolean(s.is_verified) && (
                  <button
                    type="button"
                    disabled={mutateKey === `sv-${s.id}-0`}
                    onClick={() => mutate({ op: 'student_verify', id: String(s.id), is_verified: false }, `sv-${s.id}-0`)}
                    className="bg-red-600 text-white text-xs px-3 py-1 rounded inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {mutateKey === `sv-${s.id}-0` ? <Spinner className="size-3 text-white" /> : null}
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'merchants' && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Merchants ({merchants.length})</h2>
          {merchants.map((m) => (
            <div
              key={String(m.id)}
              className="bg-[#111827] rounded-lg p-4 mb-2 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm break-words">
                  {String(m.business_name)} — {String(m.contact_phone)}
                </p>
                <p className="text-gray-400 text-xs break-words">
                  {String(m.city)} · {String(m.category)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={'text-xs px-2 py-1 rounded-full ' + (m.verified ? 'bg-green-700' : 'bg-yellow-700')}
                >
                  {m.verified ? 'Verified' : 'Pending'}
                </span>
                {!Boolean(m.verified) && (
                  <button
                    type="button"
                    disabled={mutateKey === `mv-${m.id}-1`}
                    onClick={() => mutate({ op: 'merchant_verify', id: String(m.id), verified: true }, `mv-${m.id}-1`)}
                    className="bg-green-600 text-white text-xs px-3 py-1 rounded inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {mutateKey === `mv-${m.id}-1` ? <Spinner className="size-3 text-white" /> : null}
                    Approve
                  </button>
                )}
                {Boolean(m.verified) && (
                  <button
                    type="button"
                    disabled={mutateKey === `mv-${m.id}-0`}
                    onClick={() => mutate({ op: 'merchant_verify', id: String(m.id), verified: false }, `mv-${m.id}-0`)}
                    className="bg-red-600 text-white text-xs px-3 py-1 rounded inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {mutateKey === `mv-${m.id}-0` ? <Spinner className="size-3 text-white" /> : null}
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'deals' && (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-3">
            <h2 className="text-lg font-semibold">Deals ({deals.length})</h2>
            <button
              type="button"
              onClick={() => exportCSV(redemptions, 'redemptions.csv')}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg w-full sm:w-auto"
            >
              Export Redemptions CSV
            </button>
          </div>
          {deals.map((d) => (
            <div
              key={String(d.id)}
              className="bg-[#111827] rounded-lg p-4 mb-2 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm break-words">{String(d.title)}</p>
                <p className="text-gray-400 text-xs break-words">
                  {String(d.city)} · {String(d.discount_percent)}% off
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={'text-xs px-2 py-1 rounded-full ' + (d.active ? 'bg-green-700' : 'bg-red-700')}>
                  {d.active ? 'Active' : 'Inactive'}
                </span>
                <button
                  type="button"
                  disabled={mutateKey === `da-${d.id}`}
                  onClick={() =>
                    mutate({ op: 'deal_active', id: String(d.id), active: !Boolean(d.active) }, `da-${d.id}`)
                  }
                  className="bg-gray-600 text-white text-xs px-3 py-1 rounded inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {mutateKey === `da-${d.id}` ? <Spinner className="size-3 text-white" /> : null}
                  {d.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'scholar' && (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-3">
            <h2 className="text-lg font-semibold">Scholar Leads ({scholarLeads.length})</h2>
            <button
              type="button"
              onClick={() => exportCSV(scholarLeads, 'scholar_leads.csv')}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg w-full sm:w-auto"
            >
              Export CSV
            </button>
          </div>
          {scholarLeads.map((l) => (
            <div key={String(l.id)} className="bg-[#111827] rounded-lg p-4 mb-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm break-words">
                    {String(l.student_name)} — {String(l.scholar_tier)}
                  </p>
                  <p className="text-gray-400 text-xs break-words">
                    {String(l.exam_name)} · {String(l.student_city)} · {String(l.student_phone)}
                  </p>
                </div>
                <div className="text-left sm:text-right min-w-0">
                  <p className="text-blue-400 text-xs font-semibold break-words">{String(l.institute_name)}</p>
                  <p className="text-gray-400 text-xs break-words">{String(l.offer)}</p>
                </div>
              </div>
            </div>
          ))}
          {scholarLeads.length === 0 && <p className="text-gray-500 text-sm">No leads yet.</p>}
        </div>
      )}

      {tab === 'broadcast' && (
        <div className="max-w-xl min-w-0">
          <h2 className="text-lg font-semibold mb-4">Broadcast Message</h2>
          <div className="bg-[#111827] rounded-xl p-5 space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Message</label>
              <textarea
                className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-sm h-24"
                placeholder="JEE Mains tomorrow! Here are deals near your centre..."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value.slice(0, 2000))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Filter by City (optional)</label>
              <input
                className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
                placeholder="e.g. Hyderabad"
                value={broadcastCity}
                onChange={(e) => setBroadcastCity(e.target.value.slice(0, 80))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Filter by Exam (optional)</label>
              <input
                className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
                placeholder="e.g. JEE Mains"
                value={broadcastExam}
                onChange={(e) => setBroadcastExam(e.target.value.slice(0, 80))}
              />
            </div>
            <button
              type="button"
              onClick={handleBroadcast}
              disabled={broadcastLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {broadcastLoading ? <Spinner className="text-white" /> : null}
              {broadcastLoading ? 'Working…' : 'Preview Broadcast'}
            </button>
            {broadcastResult && (
              <div className="bg-[#1f2937] rounded-lg p-3 text-xs text-gray-300 whitespace-pre-wrap break-words">
                {broadcastResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
