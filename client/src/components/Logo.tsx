interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="Instant Lapse"
    >
      <rect width="96" height="96" rx="22" fill="#F5A623" />
      <g fill="#0E1116">
        <path d="M54 20 L28 54 L45 54 L42 76 L68 42 L51 42 Z" />
        <rect x="11" y="20" width="6" height="9" rx="2" />
        <rect x="11" y="44" width="6" height="9" rx="2" />
        <rect x="11" y="68" width="6" height="9" rx="2" />
        <rect x="79" y="20" width="6" height="9" rx="2" />
        <rect x="79" y="44" width="6" height="9" rx="2" />
        <rect x="79" y="68" width="6" height="9" rx="2" />
      </g>
    </svg>
  );
}
