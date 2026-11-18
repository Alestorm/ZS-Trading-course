import React from 'react';

interface BrandLogoProps {
  className?: string;
  hideTextOnMobile?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  hideTextOnMobile = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Z (Red #DC2626) + S (Yellow #FACC15) monogram preserving ZS channel identity */}
      <div
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 ring-1 ring-zinc-800 dark:bg-black dark:ring-zinc-700 overflow-hidden"
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
          <path d="M5 10H20L9 27H20V31H4L15 14H5V10Z" fill="#DC2626" />
          <path
            d="M35 10H23.5C21.5 10 20 11.3 20 13.2V17.2C20 19.1 21.5 20.4 23.5 20.4H30.5V26.6H20.5V31H31.5C33.8 31 35.5 29.5 35.5 27.2V22.4C35.5 20.2 33.8 18.8 31.5 18.8H24.5V14.2H35V10Z"
            fill="#FACC15"
          />
        </svg>
      </div>
      <span
        className={`${
          hideTextOnMobile ? 'hidden sm:inline' : ''
        } font-display text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap`}
      >
        ZS <span className="text-red-600 dark:text-red-500">Curso</span>
      </span>
    </div>
  );
};
