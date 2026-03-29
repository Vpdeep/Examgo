import { createClient, SupabaseClient } from '@supabase/supabase-js'

let serviceClient: SupabaseClient | null = null

/** Server-only. Uses service role key; bypasses RLS. Never import in client components. */
export function createServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server operations')
  }
  serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return serviceClient
}
