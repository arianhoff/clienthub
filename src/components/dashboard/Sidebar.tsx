'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Inbox, 
  Users, 
  Calendar, 
  Image, 
  BarChart3, 
  Settings,
  LogOut,
  MessageSquare,
  AlertCircle
} from 'lucide-react'

interface SidebarProps {
  user: any
  profile: any
  orgSlug?: string
}

export function Sidebar({ user, profile, orgSlug }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // Use orgSlug from props or extract from profile
  const slug = orgSlug || profile?.organizations?.slug || ''
  const basePath = `/org/${slug}/dashboard`

  const navigation = [
    { name: 'Solicitudes', href: basePath, icon: Inbox, countKey: 'requests' },
    { name: 'Clientes', href: `${basePath}/clients`, icon: Users, countKey: 'clients' },
    { name: 'Calendario', href: `${basePath}/calendar`, icon: Calendar },
    { name: 'Archivos', href: `${basePath}/files`, icon: Image },
    { name: 'Reportes', href: `${basePath}/reports`, icon: BarChart3 },
  ]
  
  const [counts, setCounts] = useState({
    requests: 0,
    needsAttention: 0,
    clients: 0,
  })

  // Load real counts
  useEffect(() => {
    async function loadCounts() {
      if (!profile?.organization_id) return

      // Count active requests
      const { count: requestsCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .in('status', ['new', 'in_progress', 'review', 'changes_requested'])

      // Count requests needing attention (new or changes_requested)
      const { count: attentionCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .in('status', ['new', 'changes_requested'])

      // Count clients
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)

      setCounts({
        requests: requestsCount || 0,
        needsAttention: attentionCount || 0,
        clients: clientsCount || 0,
      })
    }

    loadCounts()

    // Refresh counts every 30 seconds
    const interval = setInterval(loadCounts, 30000)
    return () => clearInterval(interval)
  }, [profile?.organization_id, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/app/login')
    router.refresh()
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href={basePath} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold">ClientHub</span>
        </Link>
      </div>

      {/* Alert Banner */}
      {counts.needsAttention > 0 && (
        <Link 
          href={basePath}
          className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition"
        >
          <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {counts.needsAttention} {counts.needsAttention === 1 ? 'requiere' : 'requieren'} atención
          </div>
        </Link>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== basePath && pathname.startsWith(item.href))
            
            const count = item.countKey === 'requests' ? counts.requests :
                         item.countKey === 'clients' ? counts.clients : null
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {count !== null && count > 0 && (
                    <span className={cn(
                      'ml-auto text-xs px-2.5 py-1 rounded-full font-semibold',
                      isActive 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700">
              {getInitials(profile?.full_name, user.email)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {profile?.full_name || 'Usuario'}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {profile?.organizations?.name || 'Sin organización'}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            href={`${basePath}/settings`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition text-sm"
          >
            <Settings className="w-4 h-4" />
            Ajustes
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>
    </aside>
  )
}
