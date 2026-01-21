'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import type { Profile } from '@/types/database'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo iniciar sesión')

      // Get user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, role, client_id')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profileData) {
        throw new Error('Perfil no encontrado')
      }

      const profile = profileData as Pick<Profile, 'organization_id' | 'role' | 'client_id'>

      // Redirect based on role
      if (profile.role === 'client' && profile.client_id) {
        // Get client's organization
        const { data: client } = await supabase
          .from('clients')
          .select('organization_id')
          .eq('id', profile.client_id)
          .single()

        if (client?.organization_id) {
          // Get organization slug
          const { data: org } = await supabase
            .from('organizations')
            .select('slug')
            .eq('id', client.organization_id)
            .single()

          if (org?.slug) {
            router.push(`/org/${org.slug}/portal`)
          } else {
            throw new Error('Organización no encontrada')
          }
        } else {
          throw new Error('Cliente sin organización')
        }
      } else if (profile.organization_id) {
        // Provider/admin - go to dashboard
        const { data: org } = await supabase
          .from('organizations')
          .select('slug')
          .eq('id', profile.organization_id)
          .single()

        if (org?.slug) {
          router.push(`/org/${org.slug}/dashboard`)
        } else {
          throw new Error('Organización no encontrada')
        }
      } else {
        // No organization - go to setup
        router.push('/app/register')
      }

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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">ClientHub</span>
          </Link>
          <p className="text-gray-600">
            Iniciá sesión en tu cuenta
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tenés cuenta?{' '}
          <Link href="/app/register" className="text-primary-600 font-medium hover:text-primary-700">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
