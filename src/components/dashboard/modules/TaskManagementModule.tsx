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

  // Show only 3 tasks initially
  const displayedTasks = upcomingTasks.slice(0, 3)
  const remainingTasksCount = upcomingTasks.length - 3

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
    <div className="wedding-card h-full flex flex-col">
      <Link href="/tasks" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <List className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          <span className="truncate">Správa úkolů</span>
        </h3>
      </Link>

      <div className="space-y-4 flex-1 flex flex-col">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              <NumberCounter end={stats.completed} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Dokončeno</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              <NumberCounter end={stats.inProgress} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Probíhá</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.4s' }}>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              <NumberCounter end={stats.overdue} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Po termínu</div>
          </div>
        </div>

        {/* Upcoming Tasks Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="space-y-2">
            {upcomingTasks.length > 0 ? (
              <>
                {displayedTasks.map((task) => {
                  const TaskIcon = getTaskIcon(task.category)
                  return (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer bg-white"
                    >
                      <div className="p-1.5 bg-primary-100 rounded-lg flex-shrink-0">
                        <TaskIcon className="w-4 h-4 text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-text-primary truncate">
                          {task.title}
                        </h5>
                        <p className="text-xs text-text-muted">
                          {task.dueDate ? dateUtils.format(new Date(task.dueDate)) : 'Bez termínu'}
                        </p>
                      </div>

                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {task.priority === 'high' ? 'Vysoká' :
                         task.priority === 'medium' ? 'Střední' : 'Nízká'}
                      </div>
                    </div>
                  )
                })}

                {remainingTasksCount > 0 && (
                  <Link
                    href="/tasks"
                    className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Zobrazit více ({remainingTasksCount} {remainingTasksCount === 1 ? 'další' : remainingTasksCount < 5 ? 'další' : 'dalších'})</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Žádné nadcházející úkoly</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
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
  )
}
