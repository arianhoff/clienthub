'use client'

import { Inbox, Zap, Clock, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    total: number
    inProgress: number
    review: number
    completed: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Inbox className="w-6 h-6 text-gray-600" />
          </div>
          {stats.total > 0 && (
            <span className="text-sm text-gray-500">+3 hoy</span>
          )}
        </div>
        <div className="text-3xl font-bold">{stats.total}</div>
        <div className="text-gray-500 text-sm">Total solicitudes</div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
        <div className="text-gray-500 text-sm">En progreso</div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        <div className="text-3xl font-bold text-yellow-600">{stats.review}</div>
        <div className="text-gray-500 text-sm">Esperando aprobación</div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-sm text-gray-500">Este mes</span>
        </div>
        <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
        <div className="text-gray-500 text-sm">Completadas</div>
      </div>
    </div>
  )
}
