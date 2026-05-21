'use client'

import { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface CosmicButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantStyles = {
  primary: 'bg-ocean-surface-gradient text-white border-transparent',
  secondary: 'bg-white/10 text-shell-white border-white/20',
  outline: 'bg-transparent text-ocean-wave border-ocean-wave/50 hover:bg-ocean-wave/10',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function CosmicButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: CosmicButtonProps) {
  const baseStyles = `
    relative rounded-lg font-space-grotesk font-medium
    border transition-all duration-300
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `

  const glowStyle = variant === 'primary' 
    ? { boxShadow: `0 0 20px rgba(75, 143, 192, 0.3)` }
    : {}

  return (
    <motion.button
      className={baseStyles}
      style={glowStyle}
      whileHover={!disabled ? { 
        scale: 1.05,
        boxShadow: variant === 'primary' 
          ? '0 0 40px rgba(108, 180, 228, 0.3)'
          : '0 0 20px rgba(108, 180, 228, 0.2)',
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      {...props}
    >
      {variant === 'primary' && (
        <>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-ocean-mid via-ocean-light to-ocean-surface opacity-100" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </>
      )}
      
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: variant === 'outline' ? 'inset 0 0 0 1px rgba(108, 180, 228, 0.5)' : 'inset 0 0 0 1px rgba(168, 216, 240, 0.2)',
        }}
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </span>
      
      {!disabled && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-ocean-foam"
              style={{
                left: `${20 + i * 30}%`,
                bottom: '0',
              }}
              initial={{ y: 0, opacity: 0 }}
              whileHover={{
                y: -20,
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}
      
      {!disabled && variant === 'primary' && (
        <motion.div
          className="absolute inset-0 rounded-lg border border-ocean-foam/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.button>
  )
}
