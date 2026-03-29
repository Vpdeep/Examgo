'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CityPage() {
  const params = useParams()
  const city = String(params.cityname).toLowerCase()
  const [deals, setDeals] = useState<any[]>([])

  useEffect(() => {
    supabase.from('deals').select('*').eq('active', true).ilike('city', city).then(({ data }) => setDeals(data || []))
  }, [city])

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 capitalize">{city} Exam Guide</h1>
      <a href={"https://wa.me/?text=ExamGo " + city + " guide: examgo.vercel.app/city/" + city} target="_blank" rel="noreferrer" className="inline-block mb-6 bg-green-600 text-white text-sm px-4 py-2 rounded-lg">Share on WhatsApp</a>
      <h2 className="text-lg font-semibold mb-3">Available Deals</h2>
      {deals.length === 0 && <p className="text-gray-500 text-sm">No deals yet.</p>}
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
    </div>
  )
}