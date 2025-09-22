'use client'

import Link from 'next/link'
import { CheckCircle, Camera, Music, Flower, MapPin } from 'lucide-react'
import { useTask } from '@/hooks/useTask'
import { dateUtils } from '@/utils'

export default function UpcomingTasksModule() {
  const { tasks } = useTask()

  // Get upcoming tasks (next 5)
  const upcomingTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 5)

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
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Nadcházející úkoly</h2>
        <Link href="/tasks" className="text-sm text-primary-600 hover:underline">
          Zobrazit všechny
        </Link>
      </div>

      <div className="space-y-4">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task) => {
            const TaskIcon = getTaskIcon(task.category)
            return (
              <div
                key={task.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <TaskIcon className="w-5 h-5 text-primary-600" />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-text-primary">
                    {task.title}
                  </h3>
                  <p className="text-sm text-text-muted">
                    Termín: {task.dueDate ? dateUtils.format(new Date(task.dueDate)) : 'Bez termínu'}
                  </p>
                </div>

                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
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
          })
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Zatím nemáte žádné nadcházející úkoly</p>
            <Link href="/tasks" className="btn-primary">
              Přidat první úkol
            </Link>
          </div>
        )}
      </div>

      {upcomingTasks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link href="/tasks" className="btn-primary w-full block text-center">
            Spravovat úkoly
          </Link>
        </div>
      )}
    </div>
  )
}
