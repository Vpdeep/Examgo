import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-service'
import { assertOtpRateLimit, deliverOtpSms, OtpRateLimitError, persistOtpRow, recordOtpSend } from '@/lib/otp-send'

const schema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) })

/** Resume session: send OTP to a registered student's phone (same rate limits as registration). */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
  }

  const phone = parsed.data.phone
  const svc = createServiceClient()

  const { data: student } = await svc.from('students').select('id').eq('phone', phone).maybeSingle()

  // Do not reveal whether the number is registered
  const generic = { success: true, message: 'If this number is registered, you will receive an OTP shortly.' }

  if (!student?.id) {
    return NextResponse.json(generic)
  }

  try {
    await assertOtpRateLimit(svc, phone)
  } catch (e) {
    if (e instanceof OtpRateLimitError) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  await persistOtpRow(svc, { phone, otp, expires_at, student_id: student.id })

  const sms = await deliverOtpSms(phone, otp)
  if (!sms.ok) {
    return NextResponse.json({ error: sms.error || 'SMS failed' }, { status: 400 })
  }

  await recordOtpSend(svc, phone)
  return NextResponse.json(generic)
}
