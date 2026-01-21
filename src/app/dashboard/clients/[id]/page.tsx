import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Plus, 
  MoreVertical,
  Building,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'Nueva', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Esperando aprobación', color: 'bg-yellow-100 text-yellow-700' },
  changes_requested: { label: 'Cambios solicitados', color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-700' },
}

export default async function ClientDetailPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get client with their requests
  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      requests (*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !client) {
    notFound()
  }

  const requests = client.requests || []
  const activeRequests = requests.filter((r: any) => !['completed', 'approved'].includes(r.status))
  const completedRequests = requests.filter((r: any) => ['completed', 'approved'].includes(r.status))

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/clients"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                style={{ backgroundColor: client.color }}
              >
                {getInitials(client.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <p className="text-gray-500 text-sm">
                  {requests.length} {requests.length === 1 ? 'solicitud' : 'solicitudes'} • 
                  Cliente desde {formatDate(client.created_at)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/requests/new?client=${client.id}`}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              <Plus className="w-5 h-5" />
              Nueva solicitud
            </Link>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          
          {/* Main Content - Requests */}
          <div className="col-span-2 space-y-6">
            
            {/* Active Requests */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Solicitudes activas ({activeRequests.length})
              </h2>
              
              {activeRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 mb-4">No hay solicitudes activas</p>
                  <Link
                    href={`/dashboard/requests/new?client=${client.id}`}
                    className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
                  >
                    <Plus className="w-5 h-5" />
                    Crear solicitud
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {activeRequests.map((request: any, index: number) => {
                    const status = statusConfig[request.status] || statusConfig.new
                    
                    return (
                      <Link
                        key={request.id}
                        href={`/dashboard/requests/${request.id}`}
                        className={cn(
                          'block p-4 hover:bg-gray-50 transition',
                          index !== activeRequests.length - 1 && 'border-b border-gray-100'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{request.title}</span>
                              <span className={cn(
                                'px-2 py-0.5 text-xs rounded-full font-medium',
                                status.color
                              )}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Creada {formatDate(request.created_at)}
                              {request.due_date && ` • Entrega: ${formatDate(request.due_date)}`}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Completed Requests */}
            {completedRequests.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-500">
                  <CheckCircle className="w-5 h-5" />
                  Completadas ({completedRequests.length})
                </h2>
                
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden opacity-75">
                  {completedRequests.slice(0, 5).map((request: any, index: number) => (
                    <Link
                      key={request.id}
                      href={`/dashboard/requests/${request.id}`}
                      className={cn(
                        'block p-4 hover:bg-gray-50 transition',
                        index !== Math.min(completedRequests.length, 5) - 1 && 'border-b border-gray-100'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-600">{request.title}</span>
                          <p className="text-sm text-gray-400">
                            Completada {formatDate(request.updated_at)}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </Link>
                  ))}
                  {completedRequests.length > 5 && (
                    <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                      +{completedRequests.length - 5} más
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Client Info */}
          <div className="space-y-6">
            
            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Información de contacto
              </h3>
              
              {client.contact_name && (
                <p className="text-gray-700 mb-3">{client.contact_name}</p>
              )}
              
              <div className="space-y-3">
                {client.contact_email && (
                  <a 
                    href={`mailto:${client.contact_email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition"
                  >
                    <Mail className="w-4 h-4" />
                    {client.contact_email}
                  </a>
                )}
                {client.contact_phone && (
                  <a 
                    href={`https://wa.me/${client.contact_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition"
                  >
                    <Phone className="w-4 h-4" />
                    {client.contact_phone}
                  </a>
                )}
              </div>

              {!client.contact_name && !client.contact_email && !client.contact_phone && (
                <p className="text-sm text-gray-400 italic">Sin información de contacto</p>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Resumen
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total solicitudes</span>
                  <span className="font-medium">{requests.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Activas</span>
                  <span className="font-medium text-blue-600">{activeRequests.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completadas</span>
                  <span className="font-medium text-green-600">{completedRequests.length}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cliente desde</span>
                    <span className="font-medium">{formatDate(client.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href={`/dashboard/clients/invite?client=${client.id}`}
                className="block w-full py-3 text-center border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Invitar al portal
              </Link>
              {client.contact_phone && (
                <a
                  href={`https://wa.me/${client.contact_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
