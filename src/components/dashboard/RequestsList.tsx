'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { 
  Mail, 
  Image, 
  FileText, 
  Video,
  MoreVertical,
  MessageCircle,
  Plus,
  Palette,
  Target,
  Megaphone
} from 'lucide-react'

interface RequestsListProps {
  requests: any[]
  orgSlug?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'Nueva', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Esperando aprobación', color: 'bg-yellow-100 text-yellow-700' },
  changes_requested: { label: 'Cambios solicitados', color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-700' },
}

const typeIcons: Record<string, any> = {
  email: Mail,
  design: Palette,
  landing: FileText,
  video: Video,
  social: Image,
  branding: Target,
  ads: Megaphone,
  other: FileText,
}

const filters = ['Todas', 'Nuevas', 'En progreso', 'Esperando', 'Completadas']

export function RequestsList({ requests, orgSlug }: RequestsListProps) {
  const [activeFilter, setActiveFilter] = useState('Todas')
  
  // Build base path for links
  const basePath = orgSlug ? `/org/${orgSlug}/dashboard` : '/dashboard'

  const filteredRequests = requests.filter(request => {
    switch (activeFilter) {
      case 'Nuevas': return request.status === 'new'
      case 'En progreso': return request.status === 'in_progress'
      case 'Esperando': return request.status === 'review'
      case 'Completadas': return request.status === 'completed'
      default: return true
    }
  })

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} horas`
    if (diffDays === 1) return 'Ayer'
    return `Hace ${diffDays} días`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
        <p className="text-gray-500 mb-6">
          Creá tu primera solicitud para empezar a gestionar el trabajo.
        </p>
        <Link
          href={`${basePath}/requests/new`}
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Nueva solicitud
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                activeFilter === filter
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Todos los clientes</option>
          </select>
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Más recientes</option>
            <option>Más antiguas</option>
            <option>Por fecha límite</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filteredRequests.map((request, index) => {
          const status = statusConfig[request.status] || statusConfig.new
          const Icon = typeIcons[request.type] || FileText
          const isWaiting = request.status === 'review'
          const client = request.clients

          return (
            <Link
              href={`${basePath}/requests/${request.id}`}
              key={request.id}
              className={cn(
                'block p-5 hover:bg-gray-50 transition',
                index !== filteredRequests.length - 1 && 'border-b border-gray-100',
                isWaiting && 'bg-yellow-50/30',
                request.status === 'completed' && 'opacity-75'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  request.status === 'new' && 'bg-gray-100',
                  request.status === 'in_progress' && 'bg-blue-100',
                  request.status === 'review' && 'bg-yellow-100',
                  request.status === 'completed' && 'bg-green-100',
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    request.status === 'new' && 'text-gray-500',
                    request.status === 'in_progress' && 'text-blue-500',
                    request.status === 'review' && 'text-yellow-600',
                    request.status === 'completed' && 'text-green-500',
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {request.title}
                    </h3>
                    <span className={cn(
                      'px-2.5 py-1 text-xs rounded-full font-medium flex-shrink-0',
                      status.color
                    )}>
                      {status.label}
                    </span>
                  </div>
                  
                  {request.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                      {request.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {client && (
                      <span className="flex items-center gap-1.5">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: client.color }}
                        >
                          {getInitials(client.name)}
                        </div>
                        {client.name}
                      </span>
                    )}
                    <span>{getTimeAgo(request.created_at)}</span>
                    {request.due_date && (
                      <span className={cn(
                        new Date(request.due_date) < new Date() && request.status !== 'completed'
                          ? 'text-red-500 font-medium'
                          : ''
                      )}>
                        Vence: {new Date(request.due_date).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isWaiting && (
                    <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition">
                      Recordar cliente
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Mostrando {filteredRequests.length} de {requests.length} solicitudes
          </p>
        </div>
      )}
    </>
  )
}
