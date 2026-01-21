import { createClient } from '@/lib/supabase/server'
import { PortalRequestsList } from '@/components/portal/PortalRequestsList'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PortalPage() {
  const supabase = createClient() as any

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('client_id')
    .eq('id', user?.id ?? '')
    .single()

  // Get requests for this client
  let requests: any[] = []
  if (profile?.client_id) {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .eq('client_id', profile.client_id)
      .order('created_at', { ascending: false })

    requests = data || []
  }

  // Calculate stats
  const stats = {
    total: requests.length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    review: requests.filter(r => r.status === 'review').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  // Get first name for greeting
  const { data: fullProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const firstName = fullProfile?.full_name?.split(' ')[0] || 'Usuario'

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hola, {firstName} 👋</h1>
        <p className="text-gray-600">Acá podés ver y gestionar todas tus solicitudes.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total solicitudes</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500">En progreso</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <div className="text-3xl font-bold text-yellow-600">{stats.review}</div>
          <div className="text-sm text-gray-500">Esperan tu aprobación</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completadas</div>
        </div>
      </div>

      {/* Action Required Banner */}
      {stats.review > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-1">
                Tenés {stats.review} {stats.review === 1 ? 'propuesta esperando' : 'propuestas esperando'} tu aprobación
              </h3>
              <p className="text-yellow-700 text-sm">
                Revisá las propuestas y aprobá o pedí cambios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with New Request Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Tus solicitudes</h2>
        <Link
          href="/portal/requests/new"
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Nueva solicitud
        </Link>
      </div>

      {/* Requests List */}
      <PortalRequestsList requests={requests} />
    </>
  )
}
