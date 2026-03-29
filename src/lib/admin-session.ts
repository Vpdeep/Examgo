import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'examgo_admin'

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

export { COOKIE_NAME }

export function signAdminCookie(): string | null {
  const s = secret()
  if (!s) return null
  const exp = Date.now() + 8 * 60 * 60 * 1000
  const nonce = randomBytes(8).toString('hex')
  const payload = `${exp}:${nonce}`
  const sig = createHmac('sha256', s).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

export function verifyAdminCookieValue(token: string): boolean {
  const s = secret()
  if (!s) return false
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8')
    const last = raw.lastIndexOf(':')
    const sig = raw.slice(last + 1)
    const payload = raw.slice(0, last)
    const expected = createHmac('sha256', s).update(payload).digest('hex')
    if (sig.length !== expected.length) return false
    if (!timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))) return false
    const expRaw = payload.split(':')[0]
    const exp = Number(expRaw)
    if (!Number.isFinite(exp) || exp < Date.now()) return false
    return true
  } catch {
    return false
  }
}
