import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { phone, student_id } = await req.json()
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await supabase.from('otps').upsert({ phone, otp, expires_at, student_id })

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { 'authorization': process.env.FAST2SMS_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: phone
    })
  })

  const data = await res.json()
  if (!data.return) return NextResponse.json({ error: 'SMS failed' }, { status: 400 })
  
  return NextResponse.json({ success: true })
}