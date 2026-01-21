'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, MessageSquare } from 'lucide-react'

interface PortalNavProps {
  user: any
  profile: any
  client: any
  organization: any
  orgSlug: string
}

export function PortalNav({ user, profile, client, organization, orgSlug }: PortalNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(`/org/${orgSlug}/portal/login`)
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold">{organization?.name || 'ClientHub'}</div>
              <div className="text-sm text-gray-500">Portal de cliente</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition">
              <Bell className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: client?.color || '#6366f1' }}
              >
                {getInitials(client?.name || profile?.full_name)}
              </div>
              <div className="hidden sm:block">
                <div className="font-medium">{client?.name}</div>
                <div className="text-sm text-gray-500">{profile?.full_name}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
