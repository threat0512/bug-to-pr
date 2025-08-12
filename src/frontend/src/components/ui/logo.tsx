import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {/* Centered bug icon with better proportions */}
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg
          className="w-full h-full text-blue-600"
          viewBox="0 0 100 100"
          aria-label="BugToPR"
          role="img"
        >
          {/* Simplified, centered bug icon */}
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Bug body */}
            <ellipse cx="50" cy="55" rx="20" ry="25" />
            {/* Bug head */}
            <circle cx="50" cy="30" r="12" />
            {/* Antennae */}
            <line x1="38" y1="20" x2="30" y2="15" />
            <line x1="62" y1="20" x2="70" y2="15" />
            {/* Legs */}
            <line x1="30" y1="45" x2="15" y2="40" />
            <line x1="30" y1="55" x2="15" y2="55" />
            <line x1="30" y1="65" x2="15" y2="70" />
            <line x1="70" y1="45" x2="85" y2="40" />
            <line x1="70" y1="55" x2="85" y2="55" />
            <line x1="70" y1="65" x2="85" y2="70" />
            {/* Arrow pointing right (PR) */}
            <circle cx="75" cy="50" r="8" />
            <line x1="65" y1="50" x2="75" y2="50" />
            <line x1="75" y1="45" x2="80" y2="50" />
            <line x1="75" y1="55" x2="80" y2="50" />
          </g>
        </svg>
      </div>

      <span
        className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-4xl md:text-5xl'} leading-tight pb-1`}
      >
        BugToPR
      </span>
    </div>
  );
};

export default Logo;
