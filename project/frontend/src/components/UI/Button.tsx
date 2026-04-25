import React from 'react'
import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'

interface ButtonProps extends AntButtonProps {
  customVariant?: 'primary' | 'secondary' | 'ghost'
  customSize?: 'sm' | 'md' | 'lg'
}

const Button: React.FC<ButtonProps> = ({
  customVariant = 'primary',
  customSize = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-fast ease-out rounded'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  const variantStyles = {
    primary: 'bg-zhusha text-white hover:bg-zhusha-light hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(199,62,58,0.3)] active:bg-zhusha-dark',
    secondary: 'bg-shiqing text-white hover:bg-shiqing-light hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(46,92,138,0.3)] active:bg-shiqing-dark',
    ghost: 'bg-transparent border border-danmo-light text-mohei hover:border-zhusha hover:text-zhusha',
  }

  const combinedClassName = `${baseStyles} ${sizeStyles[customSize]} ${variantStyles[customVariant]} ${className}`

  return (
    <AntButton
      className={combinedClassName}
      {...props}
    >
      {children}
    </AntButton>
  )
}

export default Button
