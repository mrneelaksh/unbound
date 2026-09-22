/**
 * Check whether Supabase environment variables are properly configured
 * with valid URL and key values (and not default placeholder strings).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return false

  const isPlaceholderUrl =
    url.includes('your_supabase_project_url') ||
    url === 'your-supabase-url' ||
    !url.startsWith('http')

  const isPlaceholderKey =
    key.includes('your_supabase_anon_key') ||
    key === 'your-anon-key'

  return !isPlaceholderUrl && !isPlaceholderKey
}
