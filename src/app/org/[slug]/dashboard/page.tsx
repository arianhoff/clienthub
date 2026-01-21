import { createClient } from '@/lib/supabase/server'
import { RequestsList } from '@/components/dashboard/RequestsList'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { Plus, Search, Bell, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: { slug: string }
}

export default async function DashboardPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!organization) {
    return null
  }

  // Get requests
  const { data } = await supabase
    .from('requests')
    .select(`
      *,
      clients (*),
      assigned_profile:profiles!requests_assigned_to_fkey (*)
    `)
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })
  
  const requests = data || []

  // Calculate stats
  const stats = {
    total: requests.length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    review: requests.filter(r => r.status === 'review').length,
    completed: requests.filter(r => r.status === 'completed' || r.status === 'approved').length,
  }

  // Get requests that need attention
  const needsAttention = requests.filter(r => 
    r.status === 'new' || r.status === 'changes_requested'
  )

  // Get overdue requests
  const overdue = requests.filter(r => 
    r.due_date && 
    new Date(r.due_date) < new Date() && 
    !['completed', 'approved'].includes(r.status)
  )

  // Calculate trial days remaining
  let trialDaysLeft = null
  if (organization.subscription_status === 'trial' && organization.trial_ends_at) {
    const daysLeft = Math.ceil(
      (new Date(organization.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysLeft > 0) {
      trialDaysLeft = daysLeft
    }
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Solicitudes</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Gestioná las solicitudes de tus clientes
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition">
              <Bell className="w-6 h-6" />
              {needsAttention.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* New Request Button */}
            <Link 
              href={`/org/${params.slug}/dashboard/requests/new`}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              <Plus className="w-5 h-5" />
              Nueva solicitud
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        
        {/* Trial Banner */}
        {trialDaysLeft !== null && trialDaysLeft <= 7 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">
                    Te quedan {trialDaysLeft} {trialDaysLeft === 1 ? 'día' : 'días'} de prueba
                  </p>
                  <p className="text-sm text-blue-700">
                    Activá tu cuenta para seguir usando ClientHub
                  </p>
                </div>
              </div>
              <a 
                href="#"
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
              >
                Activar cuenta
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Alert Banners */}
        {(needsAttention.length > 0 || overdue.length > 0) && (
          <div className="space-y-3 mb-8">
            {/* New/Changes Requested */}
            {needsAttention.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">
                        {needsAttention.length} {needsAttention.length === 1 ? 'solicitud requiere' : 'solicitudes requieren'} tu atención
                      </p>
                      <p className="text-sm text-yellow-700">
                        {requests.filter(r => r.status === 'new').length > 0 && 
                          `${requests.filter(r => r.status === 'new').length} nuevas`}
                        {requests.filter(r => r.status === 'new').length > 0 && 
                         requests.filter(r => r.status === 'changes_requested').length > 0 && ' • '}
                        {requests.filter(r => r.status === 'changes_requested').length > 0 && 
                          `${requests.filter(r => r.status === 'changes_requested').length} con cambios solicitados`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overdue */}
            {overdue.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-800">
                      {overdue.length} {overdue.length === 1 ? 'solicitud vencida' : 'solicitudes vencidas'}
                    </p>
                    <p className="text-sm text-red-700">
                      Estas solicitudes pasaron su fecha de entrega
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <StatsCards stats={stats} />
        <RequestsList requests={requests} orgSlug={params.slug} />
      </div>
    </>
  )
}
