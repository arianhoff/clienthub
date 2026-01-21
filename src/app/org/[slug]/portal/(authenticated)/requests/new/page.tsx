'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar } from 'lucide-react'

const requestTypes = [
  { value: 'design', label: 'Diseño gráfico' },
  { value: 'social', label: 'Redes sociales' },
  { value: 'email', label: 'Email marketing' },
  { value: 'landing', label: 'Landing page' },
  { value: 'video', label: 'Video' },
  { value: 'branding', label: 'Branding' },
  { value: 'ads', label: 'Publicidad / Ads' },
  { value: 'other', label: 'Otro' },
]

export default function PortalNewRequestPage() {
  const params = useParams()
  const slug = params.slug as string
  const basePath = `/org/${slug}/portal`
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('design')
  const [dueDate, setDueDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No estás autenticado')

      const { data: profile } = await supabase
        .from('profiles')
        .select('client_id, clients(organization_id)')
        .eq('id', user.id)
        .single()

      if (!profile?.client_id) {
        throw new Error('No tenés acceso de cliente')
      }

      const organizationId = (profile.clients as any)?.organization_id

      const { error: requestError } = await supabase
        .from('requests')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          type,
          client_id: profile.client_id,
          organization_id: organizationId,
          due_date: dueDate || null,
          created_by: user.id,
          status: 'new',
          priority: 'medium',
        })

      if (requestError) throw requestError

      router.push(basePath)
      router.refresh()

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Link 
        href={basePath}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a solicitudes
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Nueva solicitud</h1>
        <p className="text-gray-600 mb-8">
          Contanos qué necesitás y nos ponemos en contacto.
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué tipo de trabajo necesitás?
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input"
              >
                {requestTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Título de la solicitud *
                </div>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Ej: Posts para Instagram de Diciembre"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué necesitás exactamente?
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[150px] resize-none"
                placeholder="Describí lo que necesitás con el mayor detalle posible..."
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  ¿Para cuándo lo necesitás?
                </div>
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Link
                href={basePath}
                className="flex-1 py-3 text-center border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
