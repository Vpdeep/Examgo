'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { dealFormSchema } from '@/lib/validation'
import { Spinner } from '@/components/ui/spinner'

export default function MerchantDashboard() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Record<string, unknown> | null>(null)
  const [deals, setDeals] = useState<Record<string, unknown>[]>([])
  const [redemptions, setRedemptions] = useState<Record<string, unknown>[]>([])
  const [showForm, setShowForm] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyMsg, setVerifyMsg] = useState('')
  const [form, setForm] = useState({ title: '', description: '', discount_percent: '', valid_until: '' })
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [dealLoading, setDealLoading] = useState(false)
  const [dealError, setDealError] = useState('')

  useEffect(() => {
    const phone = localStorage.getItem('merchantPhone')
    if (!phone) {
      router.push('/merchant/register')
      return
    }
    supabase
      .from('merchants')
      .select('*')
      .eq('contact_phone', phone)
      .limit(1)
      .then(({ data }) => {
        const m = data?.[0]
        if (!m) {
          router.push('/merchant/register')
          return
        }
        setMerchant(m as Record<string, unknown>)
        supabase
          .from('deals')
          .select('*')
          .eq('merchant_id', m.id as string)
          .then(({ data: d }) => setDeals((d || []) as Record<string, unknown>[]))
        supabase
          .from('redemptions')
          .select('*, deals(title)')
          .eq('merchant_id', m.id as string)
          .then(({ data: r }) => setRedemptions((r || []) as Record<string, unknown>[]))
      })
  }, [router])

  const handleAddDeal = async () => {
    setDealError('')
    const parsed = dealFormSchema.safeParse({
      ...form,
      discount_percent: form.discount_percent,
    })
    if (!parsed.success) {
      setDealError(parsed.error.issues.map((i) => i.message).join(', '))
      return
    }
    if (!merchant?.id) return
    setDealLoading(true)
    const { error } = await supabase.from('deals').insert([
      {
        title: parsed.data.title,
        description: parsed.data.description,
        discount_percent: parsed.data.discount_percent,
        merchant_id: merchant.id,
        city: merchant.city,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: parsed.data.valid_until,
        active: true,
      },
    ])
    setDealLoading(false)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    setShowForm(false)
    setForm({ title: '', description: '', discount_percent: '', valid_until: '' })
    supabase
      .from('deals')
      .select('*')
      .eq('merchant_id', merchant.id as string)
      .then(({ data }) => setDeals((data || []) as Record<string, unknown>[]))
  }

  const handleVerify = async () => {
    if (!merchant?.id) return
    setVerifyLoading(true)
    setVerifyMsg('')
    const code = verifyCode.trim().toUpperCase()
    const { data, error } = await supabase
      .from('redemptions')
      .select('*, students(name), deals(title)')
      .eq('code', code)
      .eq('merchant_id', merchant.id as string)
      .limit(1)
    if (error || !data || data.length === 0) {
      setVerifyMsg('Invalid code')
      setVerifyLoading(false)
      return
    }
    const r = data[0] as Record<string, unknown> & { students?: { name?: string }; deals?: { title?: string } }
    if (r.redeemed) {
      setVerifyMsg('Code already used by ' + (r.students?.name || ''))
      setVerifyLoading(false)
      return
    }
    await supabase
      .from('redemptions')
      .update({ redeemed: true, redeemed_at: new Date().toISOString() })
      .eq('id', r.id as string)
    setVerifyMsg('Verified! ' + (r.students?.name || '') + ' redeemed ' + (r.deals?.title || ''))
    supabase
      .from('redemptions')
      .select('*, deals(title)')
      .eq('merchant_id', merchant.id as string)
      .then(({ data: rd }) => setRedemptions((rd || []) as Record<string, unknown>[]))
    setVerifyLoading(false)
  }

  const thisMonth = redemptions.filter((r) => {
    return new Date(r.created_at as string).getMonth() === new Date().getMonth()
  }).length

  if (!merchant) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
        <Spinner className="size-8 text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-1 break-words">Welcome, {String(merchant.business_name)}</h1>
      <p className="text-gray-400 text-sm mb-6 break-words">
        {String(merchant.city)} · {String(merchant.category)}
      </p>

      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3 sm:gap-4">
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-blue-400">{deals.length}</p>
          <p className="text-gray-400 text-xs sm:text-sm">Active Deals</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-green-400">{redemptions.length}</p>
          <p className="text-gray-400 text-xs sm:text-sm">Total Redemptions</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-purple-400">{thisMonth}</p>
          <p className="text-gray-400 text-xs sm:text-sm">This Month</p>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl p-4 mb-6 min-w-0">
        <h2 className="text-sm font-semibold mb-3">Verify Student Code</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="min-w-0 flex-1 bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
            placeholder="6-digit code"
            value={verifyCode}
            onChange={(e) => {
              setVerifyCode(e.target.value)
              setVerifyMsg('')
            }}
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifyLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {verifyLoading ? <Spinner className="text-white size-4" /> : null}
            {verifyLoading ? 'Checking…' : 'Verify'}
          </button>
        </div>
        {verifyMsg && <p className="text-sm mt-2 text-yellow-400 break-words">{verifyMsg}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-3">
        <h2 className="text-lg font-semibold">Your Deals</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg w-full sm:w-auto"
        >
          + Add Deal
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111827] rounded-xl p-4 mb-4 space-y-3 min-w-0">
          {dealError && <p className="text-red-400 text-sm">{dealError}</p>}
          {(
            [
              { key: 'title' as const, label: 'Deal Title' },
              { key: 'description' as const, label: 'Description' },
              { key: 'discount_percent' as const, label: 'Discount %' },
              { key: 'valid_until' as const, label: 'Valid Until (YYYY-MM-DD)' },
            ] as const
          ).map((f) => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input
                className="w-full min-w-0 bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddDeal}
            disabled={dealLoading}
            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {dealLoading ? <Spinner className="text-white" /> : null}
            {dealLoading ? 'Saving…' : 'Save Deal'}
          </button>
        </div>
      )}

      {deals.map((deal) => (
        <div
          key={String(deal.id)}
          className="bg-[#111827] rounded-lg p-4 mb-2 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center min-w-0"
        >
          <div className="min-w-0">
            <p className="font-medium text-sm break-words">{String(deal.title)}</p>
            <p className="text-gray-400 text-xs break-words">{String(deal.description)}</p>
          </div>
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shrink-0 self-start">
            {String(deal.discount_percent)}%
          </span>
        </div>
      ))}

      {redemptions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Recent Redemptions</h2>
          {redemptions.map((r) => (
            <div
              key={String(r.id)}
              className="bg-[#111827] rounded-lg p-3 mb-2 text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 min-w-0"
            >
              <span className="text-gray-300 break-words">
                {(r.deals as { title?: string } | null)?.title}
              </span>
              <span className={r.redeemed ? 'text-green-400' : 'text-yellow-400'}>
                {r.redeemed ? 'Redeemed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
