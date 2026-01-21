'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User,
  Building,
  Flag,
  MessageSquare,
  Send,
  CheckCircle,
  Circle,
  PlayCircle,
  PauseCircle,
  MoreVertical,
  Mail,
  Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RequestDetailProps {
  request: any
  comments: any[]
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  new: { label: 'Nueva', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  in_progress: { label: 'En progreso', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  review: { label: 'Esperando aprobación', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  changes_requested: { label: 'Cambios solicitados', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  approved: { label: 'Aprobada', color: 'text-green-700', bgColor: 'bg-green-100' },
  completed: { label: 'Completada', color: 'text-green-700', bgColor: 'bg-green-100' },
}

const statusFlow = [
  { value: 'new', label: 'Nueva', icon: Circle },
  { value: 'in_progress', label: 'En progreso', icon: PlayCircle },
  { value: 'review', label: 'En revisión', icon: PauseCircle },
  { value: 'completed', label: 'Completada', icon: CheckCircle },
]

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'text-gray-600' },
  medium: { label: 'Media', color: 'text-blue-600' },
  high: { label: 'Alta', color: 'text-orange-600' },
  urgent: { label: 'Urgente', color: 'text-red-600' },
}

const typeLabels: Record<string, string> = {
  design: 'Diseño gráfico',
  social: 'Redes sociales',
  email: 'Email marketing',
  landing: 'Landing page',
  video: 'Video',
  branding: 'Branding',
  ads: 'Publicidad / Ads',
  other: 'Otro',
}

export function RequestDetail({ request, comments }: RequestDetailProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [currentComments, setCurrentComments] = useState(comments)
  const [currentStatus, setCurrentStatus] = useState(request.status)
  
  const router = useRouter()
  const supabase = createClient()
  
  const client = request.clients
  const status = statusConfig[currentStatus] || statusConfig.new
  const priority = priorityConfig[request.priority] || priorityConfig.medium

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true)
    
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', request.id)

    if (!error) {
      setCurrentStatus(newStatus)
    }
    
    setIsUpdatingStatus(false)
    router.refresh()
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        content: newComment.trim(),
        request_id: request.id,
        user_id: user.id,
        is_internal: false,
      })
      .select('*, profiles(*)')
      .single()

    if (!error && comment) {
      setCurrentComments([...currentComments, { ...comment, profiles: profile }])
      setNewComment('')
    }

    setIsSubmitting(false)
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{request.title}</h1>
                <span className={cn(
                  'px-3 py-1 text-sm rounded-full font-medium',
                  status.bgColor,
                  status.color
                )}>
                  {status.label}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                {client?.name} • Creada {formatDate(request.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Descripción</h2>
              {request.description ? (
                <p className="text-gray-600 whitespace-pre-wrap">{request.description}</p>
              ) : (
                <p className="text-gray-400 italic">Sin descripción</p>
              )}
            </div>

            {/* Status Flow */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4">Estado</h2>
              <div className="flex items-center justify-between">
                {statusFlow.map((s, index) => {
                  const Icon = s.icon
                  const isActive = s.value === currentStatus
                  const isPast = statusFlow.findIndex(x => x.value === currentStatus) > index
                  
                  return (
                    <div key={s.value} className="flex items-center">
                      <button
                        onClick={() => handleStatusChange(s.value)}
                        disabled={isUpdatingStatus}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-xl transition',
                          isActive && 'bg-primary-50',
                          !isActive && 'hover:bg-gray-50',
                          isUpdatingStatus && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Icon className={cn(
                          'w-8 h-8',
                          isActive && 'text-primary-600',
                          isPast && !isActive && 'text-green-500',
                          !isActive && !isPast && 'text-gray-300'
                        )} />
                        <span className={cn(
                          'text-sm font-medium',
                          isActive && 'text-primary-600',
                          !isActive && 'text-gray-500'
                        )}>
                          {s.label}
                        </span>
                      </button>
                      {index < statusFlow.length - 1 && (
                        <div className={cn(
                          'w-12 h-0.5 mx-2',
                          isPast ? 'bg-green-300' : 'bg-gray-200'
                        )} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comentarios ({currentComments.length})
              </h2>
              
              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {currentComments.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No hay comentarios todavía
                  </p>
                ) : (
                  currentComments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        {getInitials(comment.profiles?.full_name || comment.profiles?.email)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.profiles?.full_name || 'Usuario'}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {formatDate(comment.created_at)} {formatTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* New Comment Form */}
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribí un comentario..."
                  className="flex-1 input"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Client Info */}
            {client && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Cliente
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: client.color }}
                  >
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    {client.contact_name && (
                      <p className="text-sm text-gray-500">{client.contact_name}</p>
                    )}
                  </div>
                </div>
                {(client.contact_email || client.contact_phone) && (
                  <div className="border-t border-gray-100 pt-4 space-y-2">
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
                )}
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Detalles</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Tipo
                  </span>
                  <span className="text-sm font-medium">
                    {typeLabels[request.type] || request.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Prioridad
                  </span>
                  <span className={cn('text-sm font-medium', priority.color)}>
                    {priority.label}
                  </span>
                </div>
                {request.due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha límite
                    </span>
                    <span className={cn(
                      'text-sm font-medium',
                      new Date(request.due_date) < new Date() && currentStatus !== 'completed'
                        ? 'text-red-600'
                        : ''
                    )}>
                      {formatDate(request.due_date)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Creada
                  </span>
                  <span className="text-sm">
                    {formatDate(request.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            {client?.contact_phone && (
              <a
                href={`https://wa.me/${client.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hola! Te escribo por la solicitud "${request.title}".`
                )}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar por WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
