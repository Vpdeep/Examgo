import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_NAME, verifyAdminCookieValue } from '@/lib/admin-session'
import { createServiceClient } from '@/lib/supabase-service'

async function assertAdmin() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token || !verifyAdminCookieValue(token)) return null
  return createServiceClient()
}

const RESOURCES = ['students', 'merchants', 'deals', 'redemptions', 'scholar_leads'] as const

export async function GET(req: NextRequest) {
  const svc = await assertAdmin()
  if (!svc) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resource = req.nextUrl.searchParams.get('resource') as (typeof RESOURCES)[number] | null
  if (!resource || !RESOURCES.includes(resource)) {
    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  }

  const base = svc.from(resource).select('*')
  const { data, error } = await base.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
