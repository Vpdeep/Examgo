import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { studentRegisterSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = studentRegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const row = parsed.data
  const svc = createServiceClient()

  const { data, error } = await svc.from('students').insert([row]).select('id').single()
  if (error) {
    const msg = error.message || 'Registration failed'
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ id: data.id })
}
