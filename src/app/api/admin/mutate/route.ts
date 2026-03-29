import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { COOKIE_NAME, verifyAdminCookieValue } from '@/lib/admin-session'
import { createServiceClient } from '@/lib/supabase-service'

const bodySchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('student_verify'), id: z.string().uuid(), is_verified: z.boolean() }),
  z.object({ op: z.literal('merchant_verify'), id: z.string().uuid(), verified: z.boolean() }),
  z.object({ op: z.literal('deal_active'), id: z.string().uuid(), active: z.boolean() }),
])

async function svcIfAdmin() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token || !verifyAdminCookieValue(token)) return null
  return createServiceClient()
}

export async function POST(req: NextRequest) {
  const svc = await svcIfAdmin()
  if (!svc) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const b = parsed.data
  if (b.op === 'student_verify') {
    const { error } = await svc.from('students').update({ is_verified: b.is_verified }).eq('id', b.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (b.op === 'merchant_verify') {
    const { error } = await svc.from('merchants').update({ verified: b.verified }).eq('id', b.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else {
    const { error } = await svc.from('deals').update({ active: b.active }).eq('id', b.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
