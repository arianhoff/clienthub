import { createClient } from '@/lib/supabase/server'
import { ClientsList } from '@/components/dashboard/ClientsList'
import { Plus, Search, Users, Mail } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get profile with organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user?.id)
    .single()

  // Get clients
  let clients: any[] = []
  if (profile?.organization_id) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
    
    clients = data || []
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Gestioná las empresas que trabajan con vos
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

            {/* New Client Button */}
            <a 
              href="/dashboard/clients/invite"
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition"
            >
              <Mail className="w-5 h-5" />
              Invitar cliente
            </a>
            <a 
              href="/dashboard/clients/new"
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              <Plus className="w-5 h-5" />
              Nuevo cliente
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <ClientsList clients={clients} />
      </div>
    </>
  )
}
