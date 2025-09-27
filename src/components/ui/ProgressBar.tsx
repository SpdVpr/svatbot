'use client'

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showPercentage?: boolean
  color?: 'primary' | 'green' | 'blue' | 'red' | 'yellow'
}

export default function ProgressBar({ 
  progress, 
  className = '', 
  showPercentage = true,
  color = 'primary'
}: ProgressBarProps) {
  const colorClasses = {
    primary: 'bg-primary-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }

  const backgroundClasses = {
    primary: 'bg-primary-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${backgroundClasses[color]} rounded-full h-2`}>
        <div 
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}
