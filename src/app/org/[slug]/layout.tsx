import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrialExpiredModal } from '@/components/TrialExpiredModal'

interface OrgLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/app/login')
  }

  // Get organization by slug
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !organization) {
    redirect('/app/login')
  }

  // Check if user belongs to this organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clients(organization_id)')
    .eq('id', user.id)
    .single()

  const userOrgId = profile?.organization_id || (profile?.clients as any)?.organization_id

  if (userOrgId !== organization.id) {
    redirect('/app/login')
  }

  // Check trial status
  const isTrialExpired = 
    organization.subscription_status === 'trial' && 
    organization.trial_ends_at && 
    new Date(organization.trial_ends_at) < new Date()

  const isExpired = 
    isTrialExpired || 
    organization.subscription_status === 'expired'

  // Only show expired modal for admins/team, not clients
  const showExpiredModal = isExpired && profile?.role !== 'client'

  return (
    <>
      {showExpiredModal && <TrialExpiredModal organization={organization} />}
      {!showExpiredModal && children}
    </>
  )
}
