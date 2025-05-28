'use client'

import { useTask } from '@/hooks/useTask'
import { useWedding } from '@/hooks/useWedding'
import { useAuth } from '@/hooks/useAuth'

export default function TaskDebug() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { tasks, loading, error, stats } = useTask()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Task Debug Info</h3>
      
      <div className="space-y-1">
        <div><strong>User:</strong> {user?.email || 'None'}</div>
        <div><strong>Wedding ID:</strong> {wedding?.id || 'None'}</div>
        <div><strong>Tasks Count:</strong> {tasks.length}</div>
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        <div><strong>Stats:</strong> {stats.completed}/{stats.total}</div>
      </div>

      {tasks.length > 0 && (
        <div className="mt-2">
          <strong>Recent Tasks:</strong>
          <div className="max-h-32 overflow-y-auto">
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className="text-xs opacity-75">
                • {task.title} ({task.status})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs opacity-50">
        Check console for detailed logs
      </div>
    </div>
  )
}
