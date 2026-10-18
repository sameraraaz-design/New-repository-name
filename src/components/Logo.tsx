import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  inverted = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const primaryColor = inverted ? '#FFFFFF' : '#1E40AF'; // Royal/Cobalt Blue
  const secondaryColor = inverted ? '#60A5FA' : '#2563EB'; // Vibrant Blue
  const wheelColor = inverted ? '#93C5FD' : '#1D4ED8';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Unique S + Shopping Cart Monogram */}
      <div className={`relative shrink-0 flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Cart handle & upper curve of 'S' */}
          <path
            d="M20 22 H32 L40 50 H75 L84 26 H38"
            stroke={primaryColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Aerodynamic 'S' curve weaving through the basket */}
          <path
            d="M68 32 C58 24 42 26 40 38 C38 50 66 48 64 62 C62 74 46 76 34 68"
            stroke={secondaryColor}
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cart wheel 1 */}
          <circle cx="44" cy="74" r="6" fill={wheelColor} />
          {/* Cart wheel 2 */}
          <circle cx="72" cy="74" r="6" fill={wheelColor} />
          {/* Speed accent spark */}
          <path
            d="M78 20 L86 20"
            stroke={secondaryColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight leading-none ${textSizes[size]} ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          SKIRZ
        </span>
        {showTagline && (
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase mt-1 ${
              inverted ? 'text-blue-200' : 'text-blue-600'
            }`}
          >
            Shop Smart. Live Better.
          </span>
        )}
      </div>
    </div>
  );
};
