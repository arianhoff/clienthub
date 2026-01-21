import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalNav } from '@/components/portal/PortalNav'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/portal/login')
  }

  // Get user profile - must be a client
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clients(*), organizations(*)')
    .eq('id', user.id)
    .single()

  // If not a client role, redirect
  if (profile?.role !== 'client' || !profile?.client_id) {
    redirect('/portal/login?error=not_client')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav
        user={user}
        profile={profile}
        client={profile.clients}
        organization={profile.organizations}
        orgSlug={profile.organizations?.slug}
      />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
