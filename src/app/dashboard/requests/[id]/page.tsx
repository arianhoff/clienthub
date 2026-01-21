import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RequestDetail } from '@/components/dashboard/RequestDetail'

interface PageProps {
  params: { id: string }
}

export default async function RequestPage({ params }: PageProps) {
  const supabase = createClient() as any

  // Get request with client and comments
  const { data: request, error } = await supabase
    .from('requests')
    .select(`
      *,
      clients (*),
      comments (
        *,
        profiles (id, full_name, email, avatar_url, role)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !request) {
    notFound()
  }

  // Sort comments by date
  const sortedComments = request.comments?.sort(
    (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) || []

  return (
    <RequestDetail
      request={request}
      comments={sortedComments}
    />
  )
}
