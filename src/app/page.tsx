import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  MessageSquare, 
  CheckCircle, 
  Zap, 
  Users, 
  Bell, 
  Shield,
  ArrowRight,
} from 'lucide-react'

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to appropriate dashboard
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, client_id, organizations(slug), clients(organizations(slug))')
      .eq('id', user.id)
      .single()

    if (profile) {
      const p = profile as any
      // Client user
      if (p.role === 'client' && p.client_id) {
        const clientOrg = p.clients?.organizations?.slug
        if (clientOrg) {
          redirect(`/org/${clientOrg}/portal`)
        }
      }

      // Provider/admin user
      if (p.organization_id) {
        const orgSlug = p.organizations?.slug
        if (orgSlug) {
          redirect(`/org/${orgSlug}/dashboard`)
        }
      }
    }
  }

  // Not logged in - show landing page
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ClientHub</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Funcionalidades</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Precios</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">Cómo funciona</a>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/app/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 transition font-medium"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/app/register"
                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
              >
                Empezar gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              14 días de prueba gratis
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Gestioná tus clientes
              <span className="bg-gradient-to-r from-primary-500 to-emerald-500 bg-clip-text text-transparent"> sin volverte loco</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Centralizá solicitudes, organizá entregas y mantené a tus clientes informados. 
              Todo en un solo lugar, con portal dedicado para cada cliente.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/app/register"
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold transition text-lg flex items-center gap-2 shadow-lg shadow-primary-500/25"
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 px-8 py-4 font-semibold transition text-lg"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Sin tarjeta de crédito • Configuración en 2 minutos
            </p>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-b from-primary-50 to-white rounded-3xl p-4 md:p-8">
              <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total', value: '24', color: 'bg-white' },
                      { label: 'En progreso', value: '8', color: 'bg-blue-50' },
                      { label: 'Por aprobar', value: '3', color: 'bg-yellow-50' },
                      { label: 'Completadas', value: '13', color: 'bg-green-50' },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.color} p-4 rounded-xl border border-gray-200`}>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {[
                      { title: 'Campaña Instagram Navidad', client: 'TechStore', status: 'En progreso', color: 'bg-blue-100 text-blue-700' },
                      { title: 'Email marketing Black Friday', client: 'ModaPlus', status: 'Por aprobar', color: 'bg-yellow-100 text-yellow-700' },
                      { title: 'Rediseño logo', client: 'Café Roma', status: 'Completada', color: 'bg-green-100 text-green-700' },
                    ].map((item) => (
                      <div key={item.title} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.client}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.color}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-gray-500 mb-8">Usado por agencias y freelancers en toda Latinoamérica</p>
          <div className="flex items-center justify-center gap-12 opacity-50">
            {['Agencias', 'Freelancers', 'Consultoras', 'Estudios'].map((text) => (
              <div key={text} className="text-xl font-bold text-gray-400">{text}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Todo lo que necesitás</h2>
            <p className="text-xl text-gray-600">Herramientas diseñadas para profesionales de marketing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Portal del cliente',
                description: 'Cada cliente tiene su propio portal donde puede ver solicitudes, aprobar propuestas y comunicarse con vos.'
              },
              {
                icon: Bell,
                title: 'Notificaciones inteligentes',
                description: 'Alertas por email y WhatsApp cuando hay nuevas solicitudes o cambios importantes.'
              },
              {
                icon: CheckCircle,
                title: 'Flujo de aprobación',
                description: 'El cliente aprueba o pide cambios directamente. Sin emails perdidos ni malentendidos.'
              },
              {
                icon: Users,
                title: 'Gestión de equipo',
                description: 'Asigná solicitudes a miembros de tu equipo y seguí el progreso de cada uno.'
              },
              {
                icon: Zap,
                title: 'Dashboard unificado',
                description: 'Todas las solicitudes de todos tus clientes en un solo lugar. Priorizá lo importante.'
              },
              {
                icon: Shield,
                title: 'Tu marca, tu portal',
                description: 'Personalizá el portal con tu logo y colores. Tus clientes ven tu marca, no la nuestra.'
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Cómo funciona</h2>
            <p className="text-xl text-gray-600">Empezá en minutos, no en días</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Creá tu cuenta',
                description: 'Registrate gratis y configurá tu organización en menos de 2 minutos.'
              },
              {
                step: '2',
                title: 'Invitá a tus clientes',
                description: 'Agregá tus clientes y enviales acceso a su portal personalizado.'
              },
              {
                step: '3',
                title: 'Gestioná todo en un lugar',
                description: 'Recibí solicitudes, trabajá en ellas y entregá. Todo organizado y rastreable.'
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Precios simples</h2>
            <p className="text-xl text-gray-600">Elegí el plan que se adapte a tu negocio</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Freelance',
                price: 'Gratis',
                period: 'para siempre',
                description: 'Perfecto para empezar',
                features: ['3 clientes', '1 usuario', '2GB almacenamiento', 'Notificaciones email'],
                cta: 'Empezar gratis',
                popular: false
              },
              {
                name: 'Negocio',
                price: '$29',
                period: '/mes',
                description: 'Para agencias en crecimiento',
                features: ['20 clientes', '5 usuarios', '25GB almacenamiento', 'WhatsApp + Email', 'Reportes avanzados', 'Soporte prioritario'],
                cta: 'Probar 14 días gratis',
                popular: true
              },
              {
                name: 'Agencia',
                price: '$79',
                period: '/mes',
                description: 'Para equipos grandes',
                features: ['Clientes ilimitados', 'Usuarios ilimitados', '100GB almacenamiento', 'API WhatsApp Business', 'White label', 'Soporte dedicado'],
                cta: 'Contactar ventas',
                popular: false
              },
            ].map((plan) => (
              <div 
                key={plan.name} 
                className={`bg-white p-8 rounded-2xl border-2 ${
                  plan.popular 
                    ? 'border-primary-500 shadow-xl shadow-primary-500/10 scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-primary-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Más popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${
                    plan.popular
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary-500 to-emerald-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Empezá a organizar tu trabajo hoy
          </h2>
          <p className="text-xl text-white/80 mb-8">
            14 días gratis. Sin tarjeta de crédito. Cancelá cuando quieras.
          </p>
          <Link 
            href="/app/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition"
          >
            Crear cuenta gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">ClientHub</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 ClientHub. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
