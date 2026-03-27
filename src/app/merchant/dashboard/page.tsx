'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MerchantDashboard() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', discount_percent: '', valid_until: '' })

  useEffect(() => {
    const phone = localStorage.getItem('merchantPhone')
    if (!phone) { router.push('/merchant/register'); return }
    supabase.from('merchants').select('*').eq('contact_phone', phone).single().then(({ data }) => {
      setMerchant(data)
      if (data) {
        supabase.from('deals').select('*').eq('merchant_id', data.id).then(({ data: d }) => setDeals(d || []))
        supabase.from('redemptions').select('*, deals(title)').eq('merchant_id', data.id).then(({ data: r }) => setRedemptions(r || []))
      }
    })
  }, [])

  const handleAddDeal = async () => {
    const { error } = await supabase.from('deals').insert([{
      title: form.title,
      description: form.description,
      discount_percent: Number(form.discount_percent),
      merchant_id: merchant.id,
      city: merchant.city,
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: form.valid_until,
      active: true
    }])
    if (error) { alert('Error: ' + error.message); return }
    setShowForm(false)
    setForm({ title: '', description: '', discount_percent: '', valid_until: '' })
    supabase.from('deals').select('*').eq('merchant_id', merchant.id).then(({ data }) => setDeals(data || []))
  }

  if (!merchant) return <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Welcome, {merchant.business_name}</h1>
      <p className="text-gray-400 text-sm mb-6">{merchant.city} · {merchant.category}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{deals.length}</p>
          <p className="text-gray-400 text-sm">Active Deals</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{redemptions.length}</p>
          <p className="text-gray-400 text-sm">Redemptions</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Your Deals</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg">+ Add Deal</button>
      </div>

      {showForm && (
        <div className="bg-[#111827] rounded-xl p-4 mb-4 space-y-3">
          {[
            { key: 'title', label: 'Deal Title' },
            { key: 'description', label: 'Description' },
            { key: 'discount_percent', label: 'Discount %' },
            { key: 'valid_until', label: 'Valid Until (YYYY-MM-DD)' },
          ].map(function(f) {
            return (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input
                  className="w-full bg-[#1f2937] text-white rounded px-3 py-2 text-sm"
                  value={form[f.key as keyof typeof form]}
                  onChange={function(e) { setForm({ ...form, [f.key]: e.target.value }) }}
                />
              </div>
            )
          })}
          <button onClick={handleAddDeal} className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold">Save Deal</button>
        </div>
      )}

      {deals.map(function(deal) {
        return (
          <div key={deal.id} className="bg-[#111827] rounded-lg p-4 mb-2 flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{deal.title}</p>
              <p className="text-gray-400 text-xs">{deal.description}</p>
            </div>
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">{deal.discount_percent}%</span>
          </div>
        )
      })}

      {redemptions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Recent Redemptions</h2>
          {redemptions.map(function(r) {
            return (
              <div key={r.id} className="bg-[#111827] rounded-lg p-3 mb-2 text-sm text-gray-300">
                {r.deals?.title} — Student: {r.student_phone}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}