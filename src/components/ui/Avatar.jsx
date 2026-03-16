export default function Avatar({ src, alt = '', size = 'md', ring = false, className = '' }) {
  const sizes = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  }

  const initials = alt
    ? alt.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div
      className={`
        relative flex-shrink-0 rounded-full overflow-hidden
        flex items-center justify-center font-semibold text-white
        ${sizes[size] || sizes.md}
        ${ring ? 'ring-2 ring-offset-2 ring-[#8B5CF6]' : ''}
        ${className}
      `}
      style={!src ? {
        background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)'
      } : undefined}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
