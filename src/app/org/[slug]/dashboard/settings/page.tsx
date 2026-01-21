'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { 
  Building, 
  User, 
  CreditCard, 
  Bell, 
  Shield,
  Save,
  Check,
  AlertCircle,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState('organization')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Organization data
  const [organization, setOrganization] = useState<any>(null)
  const [orgName, setOrgName] = useState('')
  
  // User data
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function loadData() {
      // Get organization
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single()

      if (org) {
        setOrganization(org)
        setOrgName(org.name)
      }

      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setFullName(profileData.full_name || '')
        }
      }

      setIsLoading(false)
    }

    loadData()
  }, [supabase, slug])

  const handleSaveOrganization = async () => {
    setIsSaving(true)
    setError(null)

    const { error } = await supabase
      .from('organizations')
      .update({ name: orgName.trim() })
      .eq('id', organization.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }

    setIsSaving(false)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }

    setIsSaving(false)
  }

  const tabs = [
    { id: 'organization', label: 'Organización', icon: Building },
    { id: 'profile', label: 'Mi perfil', icon: User },
    { id: 'billing', label: 'Facturación', icon: CreditCard },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
  ]

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getDaysRemaining = () => {
    if (!organization?.trial_ends_at) return 0
    const end = new Date(organization.trial_ends_at)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold">Ajustes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Configuración de tu organización y cuenta
          </p>
        </div>
      </header>

      <div className="p-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition',
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {saved && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                <Check className="w-5 h-5" />
                Cambios guardados correctamente
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-6">Información de la organización</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la organización
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del portal
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">clienthub.app/org/</span>
                      <input
                        type="text"
                        value={organization?.slug || ''}
                        disabled
                        className="input bg-gray-50 flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      El slug no se puede cambiar después de creado
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de creación
                    </label>
                    <p className="text-gray-600">
                      {organization?.created_at ? formatDate(organization.created_at) : '-'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleSaveOrganization}
                      disabled={isSaving || !orgName.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-6">Mi perfil</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="input bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El email no se puede cambiar desde aquí
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol
                    </label>
                    <p className="text-gray-600 capitalize">{profile?.role || '-'}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving || !fullName.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold mb-6">Plan actual</h2>
                  
                  <div className={cn(
                    'rounded-xl p-6 mb-6',
                    organization?.subscription_status === 'trial' 
                      ? 'bg-yellow-50 border border-yellow-200' 
                      : 'bg-green-50 border border-green-200'
                  )}>
                    <div className="flex items-center gap-3 mb-4">
                      <Crown className={cn(
                        'w-8 h-8',
                        organization?.subscription_status === 'trial' ? 'text-yellow-500' : 'text-green-500'
                      )} />
                      <div>
                        <h3 className="font-bold text-lg">
                          {organization?.subscription_status === 'trial' ? 'Plan de prueba' : 'Plan Activo'}
                        </h3>
                        {organization?.subscription_status === 'trial' && (
                          <p className="text-sm text-yellow-700">
                            Te quedan {getDaysRemaining()} días de prueba
                          </p>
                        )}
                      </div>
                    </div>

                    {organization?.subscription_status === 'trial' && (
                      <div className="mb-4">
                        <div className="w-full bg-yellow-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${Math.max(0, 100 - (getDaysRemaining() / 14 * 100))}%` }}
                          />
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Termina el {organization?.trial_ends_at ? formatDate(organization.trial_ends_at) : '-'}
                        </p>
                      </div>
                    )}

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        3 clientes
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        Solicitudes ilimitadas
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        Portal del cliente
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        2 GB almacenamiento
                      </li>
                    </ul>

                    <a
                      href="https://wa.me/5491112345678?text=Hola!%20Quiero%20activar%20mi%20cuenta%20de%20ClientHub"
                      target="_blank"
                      className="btn-primary w-full text-center block"
                    >
                      Activar plan completo
                    </a>
                  </div>
                </div>

                {/* Available Plans */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold mb-6">Planes disponibles</h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-xl p-4">
                      <h3 className="font-semibold">Freelance</h3>
                      <p className="text-2xl font-bold mt-2">Gratis</p>
                      <p className="text-sm text-gray-500 mb-4">Para siempre</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>3 clientes</li>
                        <li>1 usuario</li>
                        <li>2 GB</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-primary-500 rounded-xl p-4 relative">
                      <span className="absolute -top-2 left-4 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                      <h3 className="font-semibold">Negocio</h3>
                      <p className="text-2xl font-bold mt-2">$29<span className="text-sm font-normal">/mes</span></p>
                      <p className="text-sm text-gray-500 mb-4">Por usuario</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>20 clientes</li>
                        <li>5 usuarios</li>
                        <li>25 GB</li>
                      </ul>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-4">
                      <h3 className="font-semibold">Agencia</h3>
                      <p className="text-2xl font-bold mt-2">$79<span className="text-sm font-normal">/mes</span></p>
                      <p className="text-sm text-gray-500 mb-4">Por usuario</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>Ilimitados</li>
                        <li>Ilimitados</li>
                        <li>100 GB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-6">Notificaciones</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Nuevas solicitudes</h3>
                      <p className="text-sm text-gray-500">Recibir email cuando un cliente crea una solicitud</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Aprobaciones</h3>
                      <p className="text-sm text-gray-500">Recibir email cuando un cliente aprueba o pide cambios</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Comentarios</h3>
                      <p className="text-sm text-gray-500">Recibir email cuando hay nuevos comentarios</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium">Recordatorio de vencimiento</h3>
                      <p className="text-sm text-gray-500">Recibir email 24hs antes de una fecha límite</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Las notificaciones se envían al email de tu cuenta: <strong>{email}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
