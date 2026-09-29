import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'default', showText = true, className = '', to = '/' }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const iconSizes = isLarge ? 'w-10 h-10' : isSmall ? 'w-7 h-7' : 'w-8 h-8';
  const textSizes = isLarge ? 'text-2xl' : isSmall ? 'text-lg' : 'text-xl';

  const content = (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Interlocking geometric violet logo mark */}
      <div className={`relative ${iconSizes} rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 p-0.5 shadow-md shadow-brand-500/25 flex items-center justify-center overflow-hidden transition-transform hover:scale-105`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          <path
            d="M8 18C6.34315 18 5 16.6569 5 15C5 13.4357 6.19694 12.1511 7.72089 12.0125C8.30752 8.58309 11.2721 6 14.8571 6C18.8021 6 22 9.19787 22 13.1429C22 13.608 21.9559 14.0624 21.8715 14.5028C22.4982 15.2005 22.9091 16.1207 22.9091 17.1364C22.9091 19.2701 21.1793 21 19.0455 21H8"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="18" r="4.5" fill="#EDE9FE" fillOpacity="0.8" />
          <path
            d="M13 18L16 15L19 18"
            stroke="#6D28D9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center">
          <span className={`${textSizes} font-extrabold text-slate-900 tracking-tight`}>
            Aura<span className="text-brand-600">Drive</span>
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
