export default function Avatar({ src, alt = '', size = 'md', ring = false, className = '' }) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  }

  const initials = alt
    ? alt.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div
      className={`
        relative flex-shrink-0 rounded-full overflow-hidden
        bg-gradient-to-br from-primary-400 to-accent-500
        flex items-center justify-center font-semibold text-white
        ${sizes[size] || sizes.md}
        ${ring ? 'ring-2 ring-offset-2 ring-primary-400' : ''}
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
