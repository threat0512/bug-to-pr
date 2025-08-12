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

const textSizeClasses = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl md:text-5xl',
};

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = true }) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {/* Inline SVG so it can take currentColor */}
      <svg
        className={`${sizeClasses[size]} text-blue-600`}
        viewBox="0 0 512 512"
        aria-label="BugToPR"
        role="img"
      >
        <g fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="176" cy="268" rx="80" ry="92" />
          <line x1="176" y1="176" x2="176" y2="360" />
          <circle cx="176" cy="148" r="36" />
          <path d="M152 122 L128 98" />
          <path d="M200 122 L224 98" />
          <path d="M96 228 C112 236, 120 244, 128 256" />
          <path d="M96 268 C112 276, 120 284, 128 296" />
          <path d="M224 256 C232 244, 240 236, 256 228" />
          <path d="M224 296 C232 284, 240 276, 256 268" />
          <circle cx="356" cy="256" r="26" />
          <path d="M256 256 H330" />
          <path d="M382 256 H448" />
          <path d="M428 236 L448 256 L428 276" />
        </g>
      </svg>

   
    </div>
  );
};

export default Logo;
