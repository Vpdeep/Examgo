import { createClient, type Session } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { createServiceClient } from '@/lib/supabase-service'

function studentAuthEmail(studentId: string) {
  return `student-${studentId}@examgo-auth.app`
}

/** After OTP is valid: ensure Supabase Auth user, link row, return session for the browser client. */
export async function ensureStudentSession(params: {
  studentId: string
  phone: string
}): Promise<{ session: Session } | { error: string }> {
  const admin = createServiceClient()
  const { data: studentRow, error: rowErr } = await admin
    .from('students')
    .select('id, phone, auth_user_id')
    .eq('id', params.studentId)
    .single()

  if (rowErr || !studentRow || studentRow.phone !== params.phone) {
    return { error: 'Student mismatch' }
  }

  const email = studentAuthEmail(params.studentId)
  const password = randomBytes(24).toString('base64url').slice(0, 40)

  let authUserId = studentRow.auth_user_id as string | null

  if (!authUserId) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { student_id: params.studentId },
    })

    if (!createErr && created?.user?.id) {
      authUserId = created.user.id
    } else if (createErr) {
      const msg = (createErr as { message?: string }).message || ''
      if (msg.toLowerCase().includes('already')) {
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
        const u = list?.users?.find((x) => x.email === email)
        if (!u?.id) return { error: 'Auth setup failed' }
        authUserId = u.id
        const { error: upErr } = await admin.auth.admin.updateUserById(authUserId, { password })
        if (upErr) return { error: upErr.message || 'Auth setup failed' }
      } else {
        return { error: msg || 'Auth setup failed' }
      }
    } else {
      return { error: 'Auth setup failed' }
    }

    const { error: linkErr } = await admin
      .from('students')
      .update({ auth_user_id: authUserId, phone_verified: true })
      .eq('id', params.studentId)
    if (linkErr) return { error: linkErr.message || 'Failed to link account' }
  } else {
    const { error: upErr } = await admin.auth.admin.updateUserById(authUserId, { password })
    if (upErr) return { error: upErr.message || 'Auth update failed' }
    const { error: pvErr } = await admin.from('students').update({ phone_verified: true }).eq('id', params.studentId)
    if (pvErr) return { error: pvErr.message || 'Failed to update profile' }
  }

  const signIn = await issueSession(email, password)
  if (signIn.error || !signIn.data.session) {
    return { error: signIn.error?.message || 'Sign-in failed' }
  }
  return { session: signIn.data.session }
}

async function issueSession(email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const browserLike = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return browserLike.auth.signInWithPassword({ email, password })
}
