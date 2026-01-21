'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Building2, ArrowRight } from 'lucide-react'

export default function OrganizationSetupPage() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient() as any

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No estás autenticado')

      const slug = generateSlug(name)

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: name.trim(),
          slug: slug,
          plan: 'freelance'
        })
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '23505') {
          throw new Error('Ya existe una organización con ese nombre')
        }
        throw orgError
      }

      // Update user profile with organization_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
          role: 'admin'
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Creá tu organización</h1>
          <p className="text-gray-600">
            Este es el nombre de tu agencia o empresa que verán tus clientes.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de tu organización
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Ej: Agencia Creativa, Marketing Pro, Tu Nombre"
                required
                minLength={2}
                maxLength={100}
              />
              {name && (
                <p className="text-sm text-gray-500 mt-2">
                  URL: clienthub.com/<span className="font-medium">{generateSlug(name)}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Creando...'
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Podés cambiar el nombre después en la configuración.
        </p>
      </div>
    </div>
  )
}
