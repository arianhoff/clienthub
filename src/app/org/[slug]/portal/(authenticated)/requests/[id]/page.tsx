import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PortalRequestDetailContent } from '@/components/portal/PortalRequestDetailContent'

interface PageProps {
  params: { slug: string; id: string }
}

export default async function PortalRequestPage({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('client_id')
    .eq('id', user?.id)
    .single()

  const { data: request, error } = await supabase
    .from('requests')
    .select(`
      *,
      comments (
        *,
        profiles (id, full_name, email, role)
      )
    `)
    .eq('id', params.id)
    .eq('client_id', profile?.client_id)
    .single()

  if (error || !request) {
    notFound()
  }

  const visibleComments = request.comments
    ?.filter((c: any) => !c.is_internal)
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || []

  return (
    <PortalRequestDetailContent 
      request={request} 
      comments={visibleComments}
      orgSlug={params.slug}
    />
  )
}
