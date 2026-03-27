import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { phone, otp, student_id } = await req.json()

  const { data } = await supabase
    .from('otps')
    .select('*')
    .eq('phone', phone)
    .eq('otp', otp)
    .single()

  if (!data) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })

  const now = new Date()
  if (new Date(data.expires_at) < now) return NextResponse.json({ error: 'OTP expired' }, { status: 400 })

  await supabase.from('students').update({ verified: true }).eq('id', student_id)

  return NextResponse.json({ success: true })
}