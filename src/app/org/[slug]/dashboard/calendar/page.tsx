import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: { slug: string }
  searchParams: { month?: string; year?: string }
}

export default async function CalendarPage({ params, searchParams }: PageProps) {
  const supabase = createClient() as any
  const basePath = `/org/${params.slug}/dashboard`

  // Get current month/year from params or use current date
  const today = new Date()
  const currentMonth = searchParams.month ? parseInt(searchParams.month) : today.getMonth()
  const currentYear = searchParams.year ? parseInt(searchParams.year) : today.getFullYear()

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', params.slug)
    .single()

  if (!organization) return null

  // Get all requests with due dates for this organization
  const { data: requests } = await supabase
    .from('requests')
    .select('*, clients(name, color)')
    .eq('organization_id', organization.id)
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

  // Group requests by date
  const requestsByDate: Record<string, any[]> = {}
  requests?.forEach((request: any) => {
    if (request.due_date) {
      const dateKey = request.due_date.split('T')[0]
      if (!requestsByDate[dateKey]) {
        requestsByDate[dateKey] = []
      }
      requestsByDate[dateKey].push(request)
    }
  })

  // Calendar helpers
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDay = firstDayOfMonth.getDay()

  // Previous/Next month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

  // Generate calendar days
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const formatDateKey = (day: number) => {
    const month = (currentMonth + 1).toString().padStart(2, '0')
    const dayStr = day.toString().padStart(2, '0')
    return `${currentYear}-${month}-${dayStr}`
  }

  const isToday = (day: number) => {
    return day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
  }

  const isPast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart
  }

  // Get upcoming deadlines (next 7 days)
  const upcomingDeadlines = requests?.filter((r: any) => {
    if (!r.due_date) return false
    const dueDate = new Date(r.due_date)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7 && r.status !== 'completed'
  }) || []

  // Get overdue
  const overdueRequests = requests?.filter((r: any) => {
    if (!r.due_date) return false
    const dueDate = new Date(r.due_date)
    return dueDate < today && r.status !== 'completed'
  }) || []

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendario</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Visualizá las fechas de entrega de tus solicitudes
            </p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">

          {/* Calendar */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Link
                  href={`${basePath}/calendar?month=${prevMonth}&year=${prevYear}`}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <h2 className="text-xl font-bold">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <Link
                  href={`${basePath}/calendar?month=${nextMonth}&year=${nextYear}`}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-24" />
                  }

                  const dateKey = formatDateKey(day)
                  const dayRequests = requestsByDate[dateKey] || []
                  const hasOverdue = dayRequests.some(r => isPast(day) && r.status !== 'completed')

                  return (
                    <div
                      key={day}
                      className={cn(
                        'h-24 p-1 border rounded-lg transition',
                        isToday(day) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200',
                        isPast(day) && !isToday(day) && 'bg-gray-50'
                      )}
                    >
                      <div className={cn(
                        'text-sm font-medium mb-1',
                        isToday(day) ? 'text-primary-600' : isPast(day) ? 'text-gray-400' : 'text-gray-700'
                      )}>
                        {day}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayRequests.slice(0, 2).map((request: any) => (
                          <Link
                            key={request.id}
                            href={`${basePath}/requests/${request.id}`}
                            className={cn(
                              'block text-xs px-1.5 py-0.5 rounded truncate',
                              request.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : isPast(day)
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                            )}
                            title={request.title}
                          >
                            {request.title}
                          </Link>
                        ))}
                        {dayRequests.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{dayRequests.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Overdue */}
            {overdueRequests.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Vencidas ({overdueRequests.length})
                </h3>
                <div className="space-y-2">
                  {overdueRequests.slice(0, 5).map((request: any) => (
                    <Link
                      key={request.id}
                      href={`${basePath}/requests/${request.id}`}
                      className="block bg-white rounded-lg p-3 hover:shadow-sm transition"
                    >
                      <div className="font-medium text-sm text-gray-900">{request.title}</div>
                      <div className="text-xs text-red-600 mt-1">
                        Venció {new Date(request.due_date).toLocaleDateString('es-AR')}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Próximas entregas
              </h3>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay entregas próximas</p>
              ) : (
                <div className="space-y-2">
                  {upcomingDeadlines.map((request: any) => {
                    const dueDate = new Date(request.due_date)
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                      <Link
                        key={request.id}
                        href={`${basePath}/requests/${request.id}`}
                        className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: request.clients?.color || '#6366f1' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {request.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.clients?.name}
                            </div>
                            <div className={cn(
                              'text-xs mt-1',
                              diffDays === 0 ? 'text-red-600 font-medium' :
                                diffDays <= 2 ? 'text-orange-600' : 'text-gray-600'
                            )}>
                              {diffDays === 0 ? 'Hoy' :
                                diffDays === 1 ? 'Mañana' :
                                  `En ${diffDays} días`}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Leyenda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded" />
                  <span className="text-gray-600">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 rounded" />
                  <span className="text-gray-600">Vencida</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded" />
                  <span className="text-gray-600">Completada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
