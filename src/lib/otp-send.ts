import type { SupabaseClient } from '@supabase/supabase-js'

export const OTP_MAX_PER_PHONE_PER_HOUR = 3

export class OtpRateLimitError extends Error {
  constructor() {
    super('Too many OTP requests. Try again in an hour.')
    this.name = 'OtpRateLimitError'
  }
}

export async function assertOtpRateLimit(svc: SupabaseClient, phone: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error } = await svc
    .from('otp_send_log')
    .select('*', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', oneHourAgo)
  if (error) throw error
  if ((count ?? 0) >= OTP_MAX_PER_PHONE_PER_HOUR) throw new OtpRateLimitError()
}

export async function recordOtpSend(svc: SupabaseClient, phone: string) {
  await svc.from('otp_send_log').insert({ phone })
}

const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2'

export async function deliverOtpSms(phone: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.FAST2SMS_KEY
  if (!key) return { ok: false, error: 'SMS gateway not configured' }
  const res = await fetch(FAST2SMS_URL, {
    method: 'POST',
    headers: { authorization: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: phone }),
  })
  const data = (await res.json()) as { return?: boolean }
  if (!data.return) return { ok: false, error: 'SMS failed' }
  return { ok: true }
}

export async function persistOtpRow(
  svc: SupabaseClient,
  row: { phone: string; otp: string; expires_at: string; student_id: string }
) {
  await svc.from('otps').upsert({ phone: row.phone, otp: row.otp, expires_at: row.expires_at, student_id: row.student_id })
}
