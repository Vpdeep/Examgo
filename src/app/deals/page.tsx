'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune']

export default function Deals() {
  const [deals, setDeals] = useState<Record<string, unknown>[]>([])
  const [city, setCity] = useState('Mumbai')
  const [loading, setLoading] = useState(true)
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [codeLoading, setCodeLoading] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSessionReady(!!session)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const loadDeals = async () => {
    setLoading(true)
    const { data } = await supabase.from('deals').select('*').eq('city', city).eq('active', true)
    setDeals((data || []) as Record<string, unknown>[])
    setLoading(false)
  }

  useEffect(() => {
    loadDeals()
  }, [city])

  const showCode = async (dealId: string) => {
    if (!sessionReady) {
      alert('Sign in from Register / Dashboard to get a deal code.')
      return
    }
    if (codes[dealId]) return
    setCodeLoading(dealId)
    try {
      const { data: st, error: stErr } = await supabase.from('students').select('id').maybeSingle()
      if (stErr || !st?.id) {
        alert('Could not load your student profile.')
        setCodeLoading(null)
        return
      }
      const { data: deal, error: dErr } = await supabase.from('deals').select('merchant_id').eq('id', dealId).single()
      if (dErr || deal?.merchant_id == null) {
        alert('Deal not found.')
        setCodeLoading(null)
        return
      }
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error: insErr } = await supabase.from('redemptions').insert([
        {
          deal_id: dealId,
          merchant_id: deal.merchant_id,
          student_id: st.id,
          code,
          redeemed: false,
        },
      ])
      if (insErr) {
        alert('Error: ' + insErr.message)
        setCodeLoading(null)
        return
      }
      setCodes({ ...codes, [dealId]: code })
    } finally {
      setCodeLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 min-w-0 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">Deals Near You</h1>
      <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
        Exclusive discounts for verified exam students.{' '}
        {!sessionReady && <span className="text-amber-400/90">Sign in to reveal codes.</span>}
      </p>

      <div className="mb-6 w-full max-w-full">
        <label className="sr-only" htmlFor="deal-city">
          City
        </label>
        <select
          id="deal-city"
          className="w-full max-w-full sm:w-auto min-w-0 bg-gray-800 text-white p-3 rounded-lg text-base"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400">
          <Spinner /> Loading deals…
        </div>
      )}

      {!loading && deals.length === 0 && (
        <div className="bg-gray-900 p-6 sm:p-8 rounded-xl text-center">
          <p className="text-gray-400 text-sm">No deals available in {city} yet. Check back soon!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((deal) => {
          const id = String(deal.id)
          const busy = codeLoading === id
          return (
            <div key={id} className="bg-gray-900 p-4 sm:p-6 rounded-xl min-w-0 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 min-w-0">
                <h3 className="text-white font-bold text-base sm:text-lg break-words min-w-0 flex-1">{String(deal.title)}</h3>
                {Number(deal.discount_percent) > 0 && (
                  <span className="bg-blue-600 text-white text-xl sm:text-2xl font-bold px-3 py-1 rounded-lg shrink-0 self-start">
                    {String(deal.discount_percent)}%
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4 flex-1 break-words">{String(deal.description)}</p>
              <p className="text-gray-500 text-xs mb-4">
                Valid: {String(deal.valid_from)} to {String(deal.valid_to)}
              </p>
              {codes[id] ? (
                <div className="bg-blue-900 p-3 rounded-lg text-center mt-auto">
                  <p className="text-gray-400 text-sm mb-1">Your Code</p>
                  <p className="text-white text-xl sm:text-2xl font-bold tracking-widest break-all">{codes[id]}</p>
                  <p className="text-gray-400 text-xs mt-1">Show this to the merchant</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => showCode(id)}
                  disabled={busy}
                  className="w-full mt-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold p-3 rounded-lg inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {busy ? <Spinner className="text-white" /> : null}
                  {busy ? 'Getting code…' : 'Show Code'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
