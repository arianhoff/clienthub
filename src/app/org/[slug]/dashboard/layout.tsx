import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/app/login')
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!organization) {
    redirect('/app/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check user belongs to org and is not a client
  if (profile?.organization_id !== organization.id || profile?.role === 'client') {
    redirect('/app/login')
  }

  // Add organization to profile for sidebar
  const profileWithOrg = {
    ...profile,
    organizations: organization
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} profile={profileWithOrg} orgSlug={params.slug} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
