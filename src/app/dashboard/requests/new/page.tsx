'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText, Calendar, Flag, User } from 'lucide-react'
import Link from 'next/link'

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

const priorities = [
  { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Media', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-700' },
]

interface Client {
  id: string
  name: string
  color: string
}

export default function NewRequestPage() {
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams.get('client')
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('design')
  const [priority, setPriority] = useState('medium')
  const [clientId, setClientId] = useState(preselectedClientId || '')
  const [dueDate, setDueDate] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Load clients on mount
  useEffect(() => {
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.organization_id) {
        const { data } = await supabase
          .from('clients')
          .select('id, name, color')
          .eq('organization_id', profile.organization_id)
          .order('name')

        setClients(data || [])
        if (data && data.length > 0) {
          // Use preselected client if provided, otherwise use first client
          if (preselectedClientId && data.find((c: Client) => c.id === preselectedClientId)) {
            setClientId(preselectedClientId)
          } else {
            setClientId(data[0].id)
          }
        }
      }
      setIsLoadingClients(false)
    }

    loadClients()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No estás autenticado')

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('No tenés una organización configurada')
      }

      const { error: requestError } = await supabase
        .from('requests')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          type,
          priority,
          client_id: clientId,
          organization_id: profile.organization_id,
          due_date: dueDate || null,
          created_by: user.id,
          status: 'new',
        })

      if (requestError) throw requestError

      router.push('/dashboard')
      router.refresh()

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingClients) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <>
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Nueva solicitud</h1>
          </div>
        </header>
        <div className="p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Primero necesitás un cliente</h3>
            <p className="text-gray-500 mb-6">
              Para crear una solicitud, primero tenés que agregar al menos un cliente.
            </p>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              Agregar cliente
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nueva solicitud</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Creá una solicitud de trabajo para un cliente
            </p>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Client Selection */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input"
                required
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
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
                placeholder="Ej: Campaña email Black Friday, Posts Instagram Noviembre"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[120px] resize-none"
                placeholder="Describí qué necesita el cliente, detalles importantes, referencias..."
              />
            </div>

            {/* Type and Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de trabajo
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

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Prioridad
                  </div>
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input"
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de entrega
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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/dashboard"
                className="flex-1 py-3 text-center border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !clientId}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando...' : 'Crear solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
