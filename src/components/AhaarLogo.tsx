type Props = { className?: string };

/**
 * Ahaar mark: a steaming bowl on a rounded leafy-green tile.
 * Flat, playful shapes in the Headspace / Groodles register.
 */
export function AhaarMark({ className = "size-9" }: Props) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Ahaar" className={className}>
      <rect width="64" height="64" rx="14" fill="#8CC220" />
      <path
        d="M14 34h36a18 18 0 0 1-36 0Z"
        fill="#FB9435"
      />
      <path
        d="M35 12c4 4-4 6 0 10s-1 6-1 6"
        fill="none"
        stroke="#F5DC7A"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M26 18c3 3-3 4.5 0 7.5s-.7 4.5-.7 4.5"
        fill="none"
        stroke="#F5DC7A"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AhaarWordmark({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AhaarMark />
      <span className="font-display text-xl font-bold lowercase tracking-tight">ahaar</span>
    </div>
  );
}
