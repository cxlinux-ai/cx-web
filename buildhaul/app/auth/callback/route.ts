import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'poster'
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // Create profile for OAuth user
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata.full_name || data.user.user_metadata.name || '',
          role: role,
        })

        // Redirect to complete onboarding
        if (role === 'driver') {
          return NextResponse.redirect(`${origin}/register/driver?oauth=true`)
        } else {
          return NextResponse.redirect(`${origin}/register/poster?oauth=true`)
        }
      }

      // Existing user - redirect to dashboard
      if (profile.role === 'driver') {
        return NextResponse.redirect(`${origin}/available`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
