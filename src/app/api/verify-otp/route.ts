import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-service'
import { ensureStudentSession } from '@/lib/student-auth'

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().regex(/^\d{6}$/),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { phone, otp } = parsed.data
  const svc = createServiceClient()

  const { data: otpRow } = await svc.from('otps').select('*').eq('phone', phone).eq('otp', otp).maybeSingle()
  if (!otpRow) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })

  const student_id = otpRow.student_id as string
  const { data: st } = await svc.from('students').select('phone').eq('id', student_id).maybeSingle()
  if (!st || st.phone !== phone) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })

  if (new Date(otpRow.expires_at as string) < new Date()) {
    return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
  }

  const auth = await ensureStudentSession({ studentId: student_id, phone })
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    session: {
      access_token: auth.session.access_token,
      refresh_token: auth.session.refresh_token,
      expires_in: auth.session.expires_in,
      expires_at: auth.session.expires_at,
      token_type: auth.session.token_type,
    },
  })
}
