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
    url.includes('your-project-ref') ||
    url.includes('your-supabase') ||
    url.includes('placeholder') ||
    url.includes('example.com') ||
    !url.startsWith('http')

  const isPlaceholderKey =
    key.includes('your_supabase_anon_key') ||
    key.includes('your-supabase-anon-key') ||
    key.includes('your-anon-key') ||
    key.includes('placeholder') ||
    key.length < 20

  return !isPlaceholderUrl && !isPlaceholderKey
}
