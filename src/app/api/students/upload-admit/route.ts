import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase-service'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'application/pdf'])

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const userSb = createClient(url, anon, { auth: { persistSession: false } })
  const { data: userData, error: userErr } = await userSb.auth.getUser(token)
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const studentIdMeta = userData.user.user_metadata?.student_id as string | undefined
  if (!studentIdMeta || typeof studentIdMeta !== 'string') {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const mime = file.type || 'application/octet-stream'
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: 'Only JPG, PNG, or PDF allowed' }, { status: 400 })
  }

  const svc = createServiceClient()
  const { data: student, error: stErr } = await svc
    .from('students')
    .select('id, auth_user_id')
    .eq('id', studentIdMeta)
    .single()

  if (stErr || !student || student.auth_user_id !== userData.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ext = mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : 'jpg'
  const path = `${student.id}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await svc.storage.from('admit-cards').upload(path, buf, {
    upsert: true,
    contentType: mime,
  })
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 400 })
  }

  const { data: urlData } = svc.storage.from('admit-cards').getPublicUrl(path)
  await svc.from('students').update({ admit_card_url: urlData.publicUrl }).eq('id', student.id)

  return NextResponse.json({ success: true, url: urlData.publicUrl })
}
