'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const cities = ['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Jaipur','Lucknow']

export default function Deals() {
  const [deals, setDeals] = useState<any[]>([])
  const [city, setCity] = useState('Mumbai')
  const [loading, setLoading] = useState(true)
  const [codes, setCodes] = useState<{[key: string]: string}>({})

  const loadDeals = async () => {
    setLoading(true)
    const { data } = await supabase.from('deals').select('*').eq('city', city).eq('active', true)
    setDeals(data || [])
    setLoading(false)
  }

  useEffect(() => { loadDeals() }, [city])

  const showCode = (dealId: string) => {
    if (!codes[dealId]) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      setCodes({...codes, [dealId]: code})
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Deals Near You</h1>
      <p className="text-gray-400 mb-6">Exclusive discounts for verified exam students</p>

      <div className="mb-6">
        <select className="bg-gray-800 text-white p-3 rounded-lg" value={city} onChange={e => setCity(e.target.value)}>
          {cities.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading && <p className="text-gray-400">Loading deals...</p>}

      {!loading && deals.length === 0 && (
        <div className="bg-gray-900 p-8 rounded-xl text-center">
          <p className="text-gray-400">No deals available in {city} yet. Check back soon!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map(deal => (
          <div key={deal.id} className="bg-gray-900 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-white font-bold text-lg">{deal.title}</h3>
              {deal.discount_percent > 0 && (
                <span className="bg-blue-600 text-white text-2xl font-bold px-3 py-1 rounded-lg">{deal.discount_percent}%</span>
              )}
            </div>
            <p className="text-gray-400 mb-4">{deal.description}</p>
            <p className="text-gray-500 text-sm mb-4">Valid: {deal.valid_from} to {deal.valid_to}</p>
            {codes[deal.id] ? (
              <div className="bg-blue-900 p-3 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-1">Your Code</p>
                <p className="text-white text-2xl font-bold tracking-widest">{codes[deal.id]}</p>
                <p className="text-gray-400 text-xs mt-1">Show this to the merchant</p>
              </div>
            ) : (
              <button onClick={() => showCode(deal.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg">
                Show Code
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}