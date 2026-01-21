'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  Image,
  Video,
  Palette,
  Target,
  Megaphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortalRequestDetailContentProps {
  request: any
  comments: any[]
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

export function PortalRequestDetailContent({ request, comments, orgSlug }: PortalRequestDetailContentProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [currentComments, setCurrentComments] = useState(comments)
  const [currentStatus, setCurrentStatus] = useState(request.status)
  const [showChangesForm, setShowChangesForm] = useState(false)
  const [changesComment, setChangesComment] = useState('')

  const router = useRouter()
  const supabase = createClient() as any
  const basePath = orgSlug ? `/org/${orgSlug}/portal` : '/portal'

  const status = statusConfig[currentStatus] || statusConfig.new
  const Icon = typeIcons[request.type] || FileText
  const needsApproval = currentStatus === 'review'

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const handleApprove = async () => {
    setIsApproving(true)
    await supabase.from('requests').update({ status: 'approved' }).eq('id', request.id)
    setCurrentStatus('approved')
    setIsApproving(false)
    router.refresh()
  }

  const handleRequestChanges = async () => {
    if (!changesComment.trim()) return
    setIsApproving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('comments').insert({ content: changesComment.trim(), request_id: request.id, user_id: user.id, is_internal: false })
      await supabase.from('requests').update({ status: 'changes_requested' }).eq('id', request.id)
      setCurrentStatus('changes_requested')
      setShowChangesForm(false)
      setChangesComment('')
    }
    setIsApproving(false)
    router.refresh()
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: comment } = await supabase.from('comments').insert({ content: newComment.trim(), request_id: request.id, user_id: user.id, is_internal: false }).select('*, profiles(*)').single()
      if (comment) {
        setCurrentComments([...currentComments, { ...comment, profiles: profile }])
        setNewComment('')
      }
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <Link href={basePath} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition">
        <ArrowLeft className="w-5 h-5" />
        Volver a solicitudes
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0', currentStatus === 'completed' || currentStatus === 'approved' ? 'bg-green-100' : currentStatus === 'review' ? 'bg-yellow-100' : currentStatus === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100')}>
            <Icon className={cn('w-7 h-7', currentStatus === 'completed' || currentStatus === 'approved' ? 'text-green-500' : currentStatus === 'review' ? 'text-yellow-600' : currentStatus === 'in_progress' ? 'text-blue-500' : 'text-gray-500')} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold">{request.title}</h1>
              <span className={cn('px-3 py-1 text-sm rounded-full font-medium', status.bgColor, status.color)}>{status.label}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Creada {formatDate(request.created_at)}</span>
              {request.due_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Entrega {formatDate(request.due_date)}</span>}
              <span>{typeLabels[request.type] || request.type}</span>
            </div>
          </div>
        </div>
      </div>

      {needsApproval && !showChangesForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-yellow-800 mb-2">Esta propuesta está lista para tu revisión</h2>
          <p className="text-yellow-700 text-sm mb-4">Revisá el trabajo y aprobalo o pedí cambios si es necesario.</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleApprove} disabled={isApproving} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50">
              <CheckCircle className="w-5 h-5" />Aprobar propuesta
            </button>
            <button onClick={() => setShowChangesForm(true)} disabled={isApproving} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50">
              <XCircle className="w-5 h-5" />Pedir cambios
            </button>
          </div>
        </div>
      )}

      {showChangesForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-orange-800 mb-2">¿Qué cambios necesitás?</h2>
          <textarea value={changesComment} onChange={(e) => setChangesComment(e.target.value)} className="w-full input min-h-[100px] mb-4" placeholder="Describí los cambios necesarios..." />
          <div className="flex gap-3">
            <button onClick={handleRequestChanges} disabled={isApproving || !changesComment.trim()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50">Enviar solicitud de cambios</button>
            <button onClick={() => setShowChangesForm(false)} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancelar</button>
          </div>
        </div>
      )}

      {request.description && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold mb-3">Descripción</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{request.description}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" />Conversación ({currentComments.length})</h2>
        <div className="space-y-4 mb-6">
          {currentComments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay mensajes todavía</p>
          ) : (
            currentComments.map((comment: any) => {
              const isClient = comment.profiles?.role === 'client'
              return (
                <div key={comment.id} className={cn('flex gap-3', isClient && 'flex-row-reverse')}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: isClient ? '#22c55e' : '#6366f1' }}>
                    {getInitials(comment.profiles?.full_name || comment.profiles?.email)}
                  </div>
                  <div className={cn('flex-1 max-w-[80%]', isClient && 'text-right')}>
                    <div className={cn('inline-block rounded-2xl px-4 py-3', isClient ? 'bg-primary-500 text-white' : 'bg-gray-100')}>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <p className={cn('text-xs text-gray-400 mt-1', isClient ? 'text-right' : 'text-left')}>{comment.profiles?.full_name} • {formatDate(comment.created_at)} {formatTime(comment.created_at)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribí un mensaje..." className="flex-1 input" />
          <button type="submit" disabled={isSubmitting || !newComment.trim()} className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-5 h-5" /></button>
        </form>
      </div>
    </>
  )
}
