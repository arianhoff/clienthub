'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, ArrowRight, Check, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [slug, setSlug] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  const router = useRouter()
  const supabase = createClient() as any

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugAvailable(null)
      return
    }

    setCheckingSlug(true)
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slugToCheck)
      .single()

    setSlugAvailable(!data)
    setCheckingSlug(false)
  }

  const handleOrgNameChange = (name: string) => {
    setOrgName(name)
    const newSlug = generateSlug(name)
    setSlug(newSlug)
    checkSlugAvailability(newSlug)
  }

  const handleSlugChange = (newSlug: string) => {
    const cleanSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(cleanSlug)
    checkSlugAvailability(cleanSlug)
  }

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStep(2)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!slugAvailable) {
      setError('El nombre de URL no está disponible')
      setIsLoading(false)
      return
    }

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      // 2. Create organization with trial
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          slug: slug,
          plan: 'freelance',
          subscription_status: 'trial',
          trial_ends_at: trialEndsAt.toISOString(),
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 3. Update user profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
          role: 'admin',
          full_name: fullName,
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      // 4. Redirect to new dashboard
      router.push(`/org/${slug}/dashboard`)
      router.refresh()

    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Ocurrió un error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">ClientHub</span>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <div className={`flex-1 h-1 rounded ${step > 1 ? 'bg-primary-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
              2
            </div>
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Creá tu cuenta</h1>
              <p className="text-gray-600 mb-8">
                Empezá tu prueba gratis de 14 días
              </p>

              <form onSubmit={handleStep1} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Tu nombre
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

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
                    placeholder="juan@agencia.com"
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
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Tu organización</h1>
              <p className="text-gray-600 mb-8">
                Este es el nombre que verán tus clientes
              </p>

              <form onSubmit={handleStep2} className="space-y-5">
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de tu agencia o empresa
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    className="input"
                    placeholder="Mi Agencia Creativa"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    URL de tu portal
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-200 px-4 py-3 rounded-l-xl text-gray-500 text-sm">
                      clienthub.com/org/
                    </span>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="input rounded-l-none flex-1"
                      placeholder="mi-agencia"
                      required
                      minLength={3}
                    />
                  </div>
                  {slug && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      {checkingSlug ? (
                        <span className="text-gray-500">Verificando...</span>
                      ) : slugAvailable === true ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Disponible
                        </span>
                      ) : slugAvailable === false ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          No disponible, probá otro
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !slugAvailable}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creando...' : 'Crear cuenta'}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Ya tenés cuenta?{' '}
            <Link href="/app/login" className="text-primary-600 font-medium hover:text-primary-700">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-emerald-500 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h2 className="text-4xl font-bold mb-6">
            Organizá tu trabajo como nunca antes
          </h2>
          <ul className="space-y-4">
            {[
              'Portal dedicado para cada cliente',
              'Solicitudes organizadas y rastreables',
              'Aprobaciones sin emails perdidos',
              'Notificaciones por WhatsApp y email',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
