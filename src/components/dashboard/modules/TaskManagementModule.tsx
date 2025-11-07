'use client'

import Link from 'next/link'
import { List, CheckCircle, Clock, AlertTriangle, ArrowRight, Camera, Music, Flower, MapPin } from 'lucide-react'
import { useTask } from '@/hooks/useTask'
import NumberCounter from '@/components/animations/NumberCounter'
import { dateUtils } from '@/utils'

export default function TaskManagementModule() {
  const { stats, tasks } = useTask()

  // Get upcoming tasks (all incomplete tasks)
  const upcomingTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  // Show only 2 tasks
  const displayedTasks = upcomingTasks.slice(0, 2)

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'photography': return Camera
      case 'music': return Music
      case 'flowers': return Flower
      case 'venue': return MapPin
      default: return CheckCircle
    }
  }

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/tasks" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <List className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          <span className="truncate">Správa úkolů</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.completed} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Dokončeno</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.inProgress} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Probíhá</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.4s' }}>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.overdue} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Po termínu</div>
            </div>
          </div>

          {/* Upcoming Tasks Section - Show 2 tasks */}
          <div className="space-y-1.5">
            {upcomingTasks.length > 0 ? (
              <>
                {displayedTasks.map((task) => {
                  const TaskIcon = getTaskIcon(task.category)
                  return (
                    <div
                      key={task.id}
                      className="flex items-center space-x-2 p-1.5 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer bg-white"
                    >
                      <div className="p-1 bg-primary-100 rounded flex-shrink-0">
                        <TaskIcon className="w-3 h-3 text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-xs text-text-primary truncate">
                          {task.title}
                        </h5>
                        <p className="text-[10px] text-text-muted">
                          {task.dueDate ? dateUtils.format(new Date(task.dueDate)) : 'Bez termínu'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="text-center py-3">
                <CheckCircle className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Žádné nadcházející úkoly</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex-shrink-0">
          <Link
            href="/tasks"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <List className="w-4 h-4" />
            <span>Spravovat úkoly</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

