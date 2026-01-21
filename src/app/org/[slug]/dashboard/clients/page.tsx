import { createClient } from '@/lib/supabase/server'
import { ClientsList } from '@/components/dashboard/ClientsList'
import { Plus, Search, Users, Mail } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: { slug: string }
}

export default async function ClientsPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!organization) {
    return null
  }

  // Get clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })

  const basePath = `/org/${params.slug}/dashboard`

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {clients?.length || 0} clientes en total
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Invite Client Button */}
            <Link 
              href={`${basePath}/clients/invite`}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition"
            >
              <Mail className="w-5 h-5" />
              Invitar cliente
            </Link>

            {/* New Client Button */}
            <Link 
              href={`${basePath}/clients/new`}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              <Plus className="w-5 h-5" />
              Nuevo cliente
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {!clients || clients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tenés clientes</h3>
            <p className="text-gray-500 mb-6">
              Agregá tu primer cliente para empezar a gestionar solicitudes.
            </p>
            <Link
              href={`${basePath}/clients/new`}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              <Plus className="w-5 h-5" />
              Agregar cliente
            </Link>
          </div>
        ) : (
          <ClientsList clients={clients} orgSlug={params.slug} />
        )}
      </div>
    </>
  )
}
