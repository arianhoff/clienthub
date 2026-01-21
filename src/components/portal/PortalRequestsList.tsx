'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Mail, 
  Image, 
  FileText, 
  Video,
  Plus,
  Palette,
  Target,
  Megaphone,
  ChevronRight,
  CheckCircle
} from 'lucide-react'

interface PortalRequestsListProps {
  requests: any[]
  orgSlug?: string
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  new: { label: 'Nueva', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  in_progress: { label: 'En progreso', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  review: { label: 'Esperando tu aprobación', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  changes_requested: { label: 'Cambios solicitados', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  approved: { label: 'Aprobada', color: 'text-green-700', bgColor: 'bg-green-100' },
  completed: { label: 'Completada', color: 'text-green-700', bgColor: 'bg-green-100' },
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

const tabs = ['Todas', 'En progreso', 'Por aprobar', 'Completadas']

export function PortalRequestsList({ requests, orgSlug }: PortalRequestsListProps) {
  const [activeTab, setActiveTab] = useState('Todas')
  const basePath = orgSlug ? `/org/${orgSlug}/portal` : '/portal'

  const filteredRequests = requests.filter(request => {
    switch (activeTab) {
      case 'En progreso': return request.status === 'in_progress' || request.status === 'new'
      case 'Por aprobar': return request.status === 'review'
      case 'Completadas': return request.status === 'completed' || request.status === 'approved'
      default: return true
    }
  })

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    return new Date(date).toLocaleDateString('es-AR')
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tenés solicitudes</h3>
        <p className="text-gray-500 mb-6">
          Creá tu primera solicitud para empezar.
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
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-3 font-medium transition -mb-px',
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const status = statusConfig[request.status] || statusConfig.new
          const Icon = typeIcons[request.type] || FileText
          const needsApproval = request.status === 'review'

          return (
            <Link
              key={request.id}
              href={`${basePath}/requests/${request.id}`}
              className={cn(
                'block bg-white rounded-2xl border p-5 hover:border-gray-300 transition',
                needsApproval ? 'border-yellow-300 border-2' : 'border-gray-200'
              )}
            >
              {needsApproval && (
                <div className="bg-yellow-50 -mx-5 -mt-5 px-5 py-3 mb-4 rounded-t-2xl border-b border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-700 font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                    </svg>
                    Requiere tu aprobación
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  request.status === 'completed' ? 'bg-green-100' : 
                  request.status === 'review' ? 'bg-yellow-100' :
                  request.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    request.status === 'completed' ? 'text-green-500' :
                    request.status === 'review' ? 'text-yellow-600' :
                    request.status === 'in_progress' ? 'text-blue-500' : 'text-gray-500'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{request.title}</h3>
                    <span className={cn(
                      'px-2.5 py-1 text-xs rounded-full font-medium',
                      status.bgColor,
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
                    <span>{getTimeAgo(request.created_at)}</span>
                    {request.due_date && (
                      <span>
                        Entrega: {new Date(request.due_date).toLocaleDateString('es-AR')}
                      </span>
                    )}
                    {request.status === 'completed' && (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Completada
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
