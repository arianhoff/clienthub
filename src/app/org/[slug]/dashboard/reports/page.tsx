import { createClient } from '@/lib/supabase/server'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Users, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: { slug: string }
}

export default async function ReportsPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', params.slug)
    .single()

  if (!organization) return null

  // Get all requests
  const { data: requests } = await supabase
    .from('requests')
    .select('*, clients(name, color)')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })

  // Get all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', organization.id)

  const allRequests = requests || []
  const allClients = clients || []
  const today = new Date()

  // Calculate metrics
  const totalRequests = allRequests.length
  const completedRequests = allRequests.filter(r => r.status === 'completed' || r.status === 'approved').length
  const inProgressRequests = allRequests.filter(r => r.status === 'in_progress').length
  const pendingRequests = allRequests.filter(r => r.status === 'new').length
  const reviewRequests = allRequests.filter(r => r.status === 'review').length

  // Overdue requests
  const overdueRequests = allRequests.filter(r => {
    if (!r.due_date || r.status === 'completed' || r.status === 'approved') return false
    return new Date(r.due_date) < today
  })

  // Completion rate
  const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0

  // Requests by type
  const requestsByType: Record<string, number> = {}
  allRequests.forEach(r => {
    requestsByType[r.type] = (requestsByType[r.type] || 0) + 1
  })

  // Requests by client
  const requestsByClient = allClients.map(client => ({
    ...client,
    requestCount: allRequests.filter(r => r.client_id === client.id).length,
    completedCount: allRequests.filter(r => r.client_id === client.id && (r.status === 'completed' || r.status === 'approved')).length,
  })).sort((a, b) => b.requestCount - a.requestCount)

  // This month's requests
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const thisMonthRequests = allRequests.filter(r => new Date(r.created_at) >= thisMonth)
  const thisMonthCompleted = thisMonthRequests.filter(r => r.status === 'completed' || r.status === 'approved')

  // Type labels
  const typeLabels: Record<string, string> = {
    design: 'Diseño gráfico',
    social: 'Redes sociales',
    email: 'Email marketing',
    landing: 'Landing page',
    video: 'Video',
    branding: 'Branding',
    ads: 'Publicidad',
    other: 'Otro',
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reportes</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Métricas y estadísticas de tu organización
            </p>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Main Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold">{totalRequests}</div>
            <div className="text-sm text-gray-500">Solicitudes</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-green-600 font-medium">{completionRate}%</span>
            </div>
            <div className="text-3xl font-bold">{completedRequests}</div>
            <div className="text-sm text-gray-500">Completadas</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-xs text-yellow-600">Activas</span>
            </div>
            <div className="text-3xl font-bold">{inProgressRequests + pendingRequests + reviewRequests}</div>
            <div className="text-sm text-gray-500">En proceso</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold">{allClients.length}</div>
            <div className="text-sm text-gray-500">Clientes</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-8">
            
            {/* This Month */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Este mes
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{thisMonthRequests.length}</div>
                  <div className="text-sm text-gray-500">Nuevas solicitudes</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{thisMonthCompleted.length}</div>
                  <div className="text-sm text-gray-500">Completadas</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {thisMonthRequests.length > 0 
                      ? Math.round((thisMonthCompleted.length / thisMonthRequests.length) * 100) 
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Tasa de completado</div>
                </div>
              </div>
            </div>

            {/* By Type */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Solicitudes por tipo
              </h2>
              {Object.keys(requestsByType).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay datos suficientes</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(requestsByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const percentage = Math.round((count / totalRequests) * 100)
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{typeLabels[type] || type}</span>
                            <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Estado de solicitudes
              </h2>
              <div className="grid grid-cols-5 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-gray-600">{pendingRequests}</div>
                  <div className="text-xs text-gray-500">Nuevas</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-xl font-bold text-blue-600">{inProgressRequests}</div>
                  <div className="text-xs text-gray-500">En progreso</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <div className="text-xl font-bold text-yellow-600">{reviewRequests}</div>
                  <div className="text-xs text-gray-500">En revisión</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">{completedRequests}</div>
                  <div className="text-xs text-gray-500">Completadas</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <div className="text-xl font-bold text-red-600">{overdueRequests.length}</div>
                  <div className="text-xs text-gray-500">Vencidas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Top Clients */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Clientes por actividad
              </h2>
              {requestsByClient.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay clientes</p>
              ) : (
                <div className="space-y-3">
                  {requestsByClient.slice(0, 5).map((client, index) => (
                    <div key={client.id} className="flex items-center gap-3">
                      <div className="text-sm text-gray-400 w-4">{index + 1}</div>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: client.color }}
                      >
                        {getInitials(client.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{client.name}</div>
                        <div className="text-xs text-gray-500">
                          {client.completedCount}/{client.requestCount} completadas
                        </div>
                      </div>
                      <div className="text-sm font-medium">{client.requestCount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overdue Alert */}
            {overdueRequests.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Requieren atención
                </h3>
                <div className="space-y-2">
                  {overdueRequests.slice(0, 3).map((request: any) => (
                    <div key={request.id} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-sm">{request.title}</div>
                      <div className="text-xs text-gray-500">{request.clients?.name}</div>
                      <div className="text-xs text-red-600 mt-1">
                        Venció {new Date(request.due_date).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  ))}
                  {overdueRequests.length > 3 && (
                    <p className="text-xs text-red-700 text-center">
                      +{overdueRequests.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">Resumen rápido</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-primary-100">Tasa de éxito</span>
                  <span className="font-bold">{completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-100">Promedio/cliente</span>
                  <span className="font-bold">
                    {allClients.length > 0 ? (totalRequests / allClients.length).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-100">Este mes</span>
                  <span className="font-bold">{thisMonthRequests.length} nuevas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
