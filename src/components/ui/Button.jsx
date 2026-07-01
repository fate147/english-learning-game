export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    ghost: 'btn btn-ghost',
    danger: 'btn btn-danger',
    outline: 'btn btn-outline',
    success: 'btn btn-success',
    warning: 'btn btn-warning',
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant] || 'btn btn-primary'} ${sizeClasses[size] || ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
