interface LogoMarkProps {
  size?: number;
  id?: string;
}

export const LogoMark = ({ size = 38, id = 'logo' }: LogoMarkProps) => (
  <svg
    width={size}
    height={Math.round(size * 1.2)}
    viewBox="0 0 38 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="38" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E8CC6A" />
        <stop offset="55%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#9A7A10" />
      </linearGradient>
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="38" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
        <stop offset="40%" stopColor="rgba(255,255,255,0.12)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9A7A10" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Card body */}
    <rect
      x="1" y="1" width="36" height="44" rx="6"
      fill={`url(#${id}-grad)`}
      filter={`url(#${id}-shadow)`}
    />

    {/* Sheen overlay */}
    <rect x="1" y="1" width="36" height="44" rx="6" fill={`url(#${id}-sheen)`} />

    {/* Subtle inner border */}
    <rect x="2.5" y="2.5" width="33" height="41" rx="5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" fill="none" />

    {/* Heart suit — centered */}
    <path
      d="M19 35
         C19 35 9 27.5 9 20.5
         C9 17.1 11.7 14.5 15 14.5
         C17 14.5 18.7 15.5 19 17
         C19.3 15.5 21 14.5 23 14.5
         C26.3 14.5 29 17.1 29 20.5
         C29 27.5 19 35 19 35Z"
      fill="rgba(5,10,20,0.75)"
    />

    {/* Small pip — top-left corner */}
    <text
      x="4.5" y="9.5"
      fontSize="5"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fill="rgba(5,10,20,0.6)"
    >♥</text>

    {/* Small pip — bottom-right (rotated) */}
    <text
      x="33.5" y="40.5"
      fontSize="5"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fill="rgba(5,10,20,0.6)"
      textAnchor="end"
    >♥</text>
  </svg>
);

interface LogoWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const LogoWordmark = ({ size = 'md', variant = 'light' }: LogoWordmarkProps) => {
  const sizes = {
    sm: { mark: 28, text: 'text-base', sub: 'text-[10px]' },
    md: { mark: 34, text: 'text-xl',   sub: 'text-xs' },
    lg: { mark: 44, text: 'text-2xl',  sub: 'text-sm' },
  };
  const s = sizes[size];
  const primaryColor  = variant === 'light' ? 'text-white'    : 'text-dark-900';
  const accentColor   = variant === 'light' ? 'text-gold-400' : 'text-gold-500';
  const captionColor  = variant === 'light' ? 'text-dark-400' : 'text-slate-500';

  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={s.mark} />
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold ${s.text} ${primaryColor} tracking-tight`}>
          Heart of the <span className={accentColor}>Cards</span>
        </span>
        <span className={`${s.sub} ${captionColor} font-medium tracking-widest uppercase mt-0.5`}>
          Australia's TCG Store
        </span>
      </div>
    </div>
  );
};
