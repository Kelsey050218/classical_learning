import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'zhusha' | 'shiqing' | 'tenghuang' | 'zhuqing' | 'yanzhi' | 'default'
  size?: 'sm' | 'md'
  className?: string
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center gap-1 rounded-full font-medium'

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const variantStyles = {
    zhusha: 'bg-zhusha-100 text-zhusha',
    shiqing: 'bg-shiqing-100 text-shiqing',
    tenghuang: 'bg-tenghuang-100 text-tenghuang-dark',
    zhuqing: 'bg-green-100 text-green-700',
    yanzhi: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-600',
  }

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  return (
    <span className={combinedClassName}>
      {children}
    </span>
  )
}

export default Badge
