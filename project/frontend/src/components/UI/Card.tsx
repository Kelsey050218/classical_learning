import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'paper' | 'locked' | 'completed'
  hover?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
}) => {
  const baseStyles = 'bg-white rounded-lg p-6 transition-all duration-normal ease-out'

  const variantStyles = {
    default: 'shadow-paper',
    paper: 'shadow-card bg-xuanzhi',
    locked: 'opacity-60 grayscale-[0.5] shadow-paper',
    completed: 'border-2 border-tenghuang shadow-card',
  }

  const hoverStyles = hover && variant !== 'locked'
    ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'
    : ''

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`

  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  )
}

export default Card
