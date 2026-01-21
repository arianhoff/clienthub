import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalNav } from '@/components/portal/PortalNav'

interface PortalLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/org/${params.slug}/portal/login`)
  }

  // Get organization by slug
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!organization) {
    redirect('/app/login')
  }

  // Get user profile - must be a client
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clients(*)')
    .eq('id', user.id)
    .single()

  // Verify user is a client of this organization
  if (profile?.role !== 'client' || !profile?.client_id) {
    redirect(`/org/${params.slug}/portal/login?error=not_client`)
  }

  const client = profile.clients as any
  if (client?.organization_id !== organization.id) {
    redirect(`/org/${params.slug}/portal/login?error=wrong_org`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav 
        user={user} 
        profile={profile} 
        client={client}
        organization={organization}
        orgSlug={params.slug}
      />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
