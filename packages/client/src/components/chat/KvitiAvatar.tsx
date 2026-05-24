interface KvitiAvatarProps {
  size?: number
  className?: string
}

export function KvitiAvatar({ size = 20, className = '' }: KvitiAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kviti-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
      </defs>
      <path
        fill="url(#kviti-leaf)"
        d="M32 10c-1 11-9 19-19 21 2-10 10-18 19-21Zm0 0c9 3 17 11 19 21-10-2-18-10-19-21Z"
      />
      <path
        fill="#ffffff"
        opacity="0.7"
        d="M32 17c-6 5-10 12-11 21 7-2.5 12.5-8 15-15 2.5 7 8 12.5 15 15-1-9-5-16-11-21-1.5 5-4 9-8 11.5-4-2.5-6.5-6.5-8-11.5Z"
      />
    </svg>
  )
}
