'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { redeemCodeSchema } from '@/lib/validation'
import { Spinner } from '@/components/ui/spinner'

export default function MerchantVerifyCode() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [redeemLoading, setRedeemLoading] = useState(false)

  const verify = async () => {
    setError('')
    setResult(null)
    const upper = code.trim().toUpperCase()
    const parsed = redeemCodeSchema.safeParse(upper)
    if (!parsed.success) {
      setError('Enter a valid code (4–10 letters or digits)')
      return
    }
    setVerifyLoading(true)
    const { data, error: qErr } = await supabase.from('redemptions').select('*').eq('code', parsed.data).limit(5)
    setVerifyLoading(false)
    if (qErr || !data || data.length === 0) {
      setError('Code not found')
      return
    }
    if (data.length > 1) {
      setError('Ambiguous code — contact support')
      return
    }
    setResult(data[0] as Record<string, unknown>)
  }

  const markRedeemed = async () => {
    const parsed = redeemCodeSchema.safeParse(code.trim().toUpperCase())
    if (!parsed.success) return
    setRedeemLoading(true)
    await supabase.from('redemptions').update({ redeemed: true }).eq('code', parsed.data)
    setRedeemLoading(false)
    setResult(result ? { ...result, redeemed: true } : null)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 sm:p-8 rounded-xl w-full max-w-md min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">Verify Student Code</h1>
        {error && <p className="text-red-400 text-sm mb-4 break-words">{error}</p>}
        <input
          placeholder="Enter code"
          className="w-full min-w-0 bg-gray-800 text-white p-3 rounded-lg mb-4 text-center text-xl tracking-widest uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={10}
        />
        <button
          type="button"
          onClick={verify}
          disabled={verifyLoading}
          className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg mb-4 inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {verifyLoading ? <Spinner className="text-white" /> : null}
          {verifyLoading ? 'Verifying…' : 'Verify Code'}
        </button>
        {result && (
          <div className="bg-gray-800 p-4 rounded-lg min-w-0">
            <p className="text-white font-bold break-all">Code: {String(result.code)}</p>
            <p className="text-gray-400 text-sm break-words">Deal ID: {String(result.deal_id)}</p>
            <p className="text-gray-400 text-sm">
              Status: {result.redeemed ? 'Already Redeemed' : 'Valid'}
            </p>
            {!result.redeemed && (
              <button
                type="button"
                onClick={markRedeemed}
                disabled={redeemLoading}
                className="w-full bg-green-600 text-white font-bold p-3 rounded-lg mt-3 inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {redeemLoading ? <Spinner className="text-white" /> : null}
                {redeemLoading ? 'Saving…' : 'Mark as Redeemed'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
