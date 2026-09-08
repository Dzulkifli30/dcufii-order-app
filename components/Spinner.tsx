import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, { dim: string; strokeWidth: number }> = {
  sm: { dim: 'w-5 h-5', strokeWidth: 3 },
  md: { dim: 'w-8 h-8', strokeWidth: 3 },
  lg: { dim: 'w-12 h-12', strokeWidth: 2.5 },
};

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const { dim, strokeWidth } = sizeMap[size];

  return (
    <svg
      className={`${dim} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Memuat..."
      role="status"
    >
      {/* Track circle */}
      <circle
        className="opacity-25 stroke-brand-primary"
        cx="12"
        cy="12"
        r="10"
        strokeWidth={strokeWidth}
      />
      {/* Spinning arc */}
      <path
        className="opacity-75 stroke-brand-secondary"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        d="M12 2a10 10 0 0 1 10 10"
      />
    </svg>
  );
}
