import React from 'react'

interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  variant?: 'default' | 'gradient'
  className?: string
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  variant = 'default',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const trackStyles = 'w-full bg-danmo-light rounded-full overflow-hidden'

  const fillStyles = variant === 'gradient'
    ? 'h-full bg-gradient-to-r from-zhusha to-tenghuang rounded-full transition-all duration-slow ease-out'
    : 'h-full bg-zhusha rounded-full transition-all duration-slow ease-out'

  return (
    <div className={`w-full ${className}`}>
      <div className={`${trackStyles} ${sizeStyles[size]}`}>
        <div
          className={fillStyles}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-danmo">
          <span>进度</span>
          <span className="font-medium text-mohei">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  )
}

export default Progress
