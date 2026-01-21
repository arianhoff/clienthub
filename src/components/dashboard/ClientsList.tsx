'use client'

import Link from 'next/link'
import { Users, Mail, Phone, MoreVertical, Plus } from 'lucide-react'
import type { Client } from '@/types/database'

interface ClientsListProps {
  clients: Client[]
  orgSlug?: string
}

export function ClientsList({ clients, orgSlug }: ClientsListProps) {
  const basePath = orgSlug ? `/org/${orgSlug}/dashboard` : '/dashboard'
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    return `Hace ${Math.floor(diffDays / 30)} meses`
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tenés clientes</h3>
        <p className="text-gray-500 mb-6">
          Agregá tu primer cliente para empezar a gestionar solicitudes.
        </p>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Agregar cliente
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <Link
          key={client.id}
          href={`${basePath}/clients/${client.id}`}
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: client.color }}
              >
                {getInitials(client.name)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                  {client.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Agregado {getTimeAgo(client.created_at)}
                </p>
              </div>
            </div>
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
              onClick={(e) => e.preventDefault()}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {(client.contact_name || client.contact_email || client.contact_phone) && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {client.contact_name && (
                <p className="text-sm text-gray-600">
                  {client.contact_name}
                </p>
              )}
              {client.contact_email && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {client.contact_email}
                </p>
              )}
              {client.contact_phone && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {client.contact_phone}
                </p>
              )}
            </div>
          )}

          {!client.contact_name && !client.contact_email && !client.contact_phone && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-400 italic">
                Sin información de contacto
              </p>
            </div>
          )}
        </Link>
      ))}

      {/* Add Client Card */}
      <Link
        href="/dashboard/clients/new"
        className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 hover:border-primary-300 hover:bg-primary-50/30 transition flex flex-col items-center justify-center min-h-[180px] group"
      >
        <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-xl flex items-center justify-center mb-3 transition">
          <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition" />
        </div>
        <p className="font-medium text-gray-600 group-hover:text-primary-600 transition">
          Agregar cliente
        </p>
      </Link>
    </div>
  )
}
