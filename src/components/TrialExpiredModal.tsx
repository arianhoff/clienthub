'use client'

import { AlertCircle, CreditCard, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface TrialExpiredModalProps {
  organization: any
}

export function TrialExpiredModal({ organization }: TrialExpiredModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">Tu prueba ha terminado</h2>
          
          <p className="text-gray-600 mb-6">
            El período de prueba de <span className="font-semibold">{organization.name}</span> ha finalizado. 
            Para seguir usando ClientHub, elegí un plan.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-500 mb-2">Plan recomendado</div>
            <div className="text-xl font-bold">Negocio - $29/mes</div>
            <div className="text-sm text-gray-600">20 clientes, 5 usuarios, WhatsApp + Email</div>
          </div>

          <div className="space-y-3">
            <a
              href="https://wa.me/5491123456789?text=Hola!%20Quiero%20activar%20mi%20cuenta%20de%20ClientHub"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition"
            >
              <CreditCard className="w-5 h-5" />
              Activar mi cuenta
            </a>
            
            <a
              href="https://wa.me/5491123456789?text=Hola!%20Tengo%20una%20consulta%20sobre%20ClientHub"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              <MessageSquare className="w-5 h-5" />
              Contactar soporte
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Tus datos están seguros y se mantendrán por 30 días.
          </p>
        </div>
      </div>
    </div>
  )
}
