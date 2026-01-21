'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Send, Copy, Check } from 'lucide-react'

interface Client {
  id: string
  name: string
  color: string
  contact_email: string | null
}

export default function InviteClientPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const router = useRouter()
  const supabase = createClient() as any

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
          .select('id, name, color, contact_email')
          .eq('organization_id', profile.organization_id)
          .order('name')

        setClients(data || [])
        if (data && data.length > 0) {
          setSelectedClientId(data[0].id)
          if (data[0].contact_email) {
            setEmail(data[0].contact_email)
          }
        }
      }
      setIsLoadingClients(false)
    }

    loadClients()
  }, [supabase])

  // Update email when client changes
  useEffect(() => {
    const client = clients.find(c => c.id === selectedClientId)
    if (client?.contact_email) {
      setEmail(client.contact_email)
    }
  }, [selectedClientId, clients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Create user with magic link
      const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${window.location.origin}/portal`,
        },
      })

      // If we can't use admin API, fall back to invite
      const { error: inviteError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
          data: {
            full_name: fullName,
            role: 'client',
            client_id: selectedClientId,
          },
        },
      })

      if (inviteError) throw inviteError

      // We need to wait for the user to be created, then update their profile
      // For now, we'll store the pending invite info

      setSuccess(true)
      setInviteLink(`${window.location.origin}/portal/login`)

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al enviar la invitación')
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              href="/dashboard/clients"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Invitar cliente</h1>
          </div>
        </header>
        <div className="p-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto">
            <p className="text-gray-500 mb-4">
              Primero necesitás crear un cliente para poder invitarlo.
            </p>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              Crear cliente
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (success) {
    return (
      <>
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/clients"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Invitación enviada</h1>
          </div>
        </header>
        <div className="p-8 max-w-2xl">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">¡Invitación enviada!</h2>
            <p className="text-green-700 mb-6">
              Se envió un email a <span className="font-medium">{email}</span> con un link para acceder al portal.
            </p>

            <div className="bg-white rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">También podés compartir este link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 input text-sm"
                />
                <button
                  onClick={copyLink}
                  className="btn-secondary px-4 py-3"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard/clients"
                className="btn-secondary"
              >
                Volver a clientes
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                  setFullName('')
                }}
                className="btn-primary"
              >
                Invitar otro cliente
              </button>
            </div>
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
            href="/dashboard/clients"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Invitar cliente</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Enviá un acceso al portal para que tu cliente pueda ver y crear solicitudes
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
                Cliente
              </label>
              <select
                id="client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="input"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del contacto
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Nombre y apellido"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="contacto@empresa.com"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                El cliente recibirá un email con un link para acceder al portal.
                No necesita crear contraseña, accede con un link mágico.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/dashboard/clients"
                className="flex-1 py-3 text-center border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading || !email.trim() || !fullName.trim()}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Enviando...' : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar invitación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
