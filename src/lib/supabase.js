import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient throws on a missing URL, which would take the whole app down
// with it. Accounts are optional — the tool works anonymously — so degrade to
// "signed out, sign-in unavailable" instead.
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — sign-in and saved decks are disabled.')
}

export const supabase = supabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// The signed-in user's access token, or null when signed out / unconfigured.
export async function getAccessToken() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
