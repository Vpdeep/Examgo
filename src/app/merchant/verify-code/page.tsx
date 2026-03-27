'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MerchantVerifyCode() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const verify = async () => {
    setError('')
    setResult(null)
    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .eq('code', code.toUpperCase())
    if (error || !data || data.length === 0) { setError('Code not found'); return }
    setResult(data[0])
  }

  const markRedeemed = async () => {
    await supabase.from('redemptions').update({ redeemed: true }).eq('code', code.toUpperCase())
    setResult({...result, redeemed: true})
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Verify Student Code</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <input placeholder="Enter 6-digit code" className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 text-center text-2xl tracking-widest uppercase" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
        <button onClick={verify} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg mb-4">Verify Code</button>
        {result && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-white font-bold">Code: {result.code}</p>
            <p className="text-gray-400">Deal ID: {result.deal_id}</p>
            <p className="text-gray-400">Status: {result.redeemed ? '⚠️ Already Redeemed' : '✅ Valid'}</p>
            {!result.redeemed && (
              <button onClick={markRedeemed} className="w-full bg-green-600 text-white font-bold p-3 rounded-lg mt-3">Mark as Redeemed</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}