import React, { useState, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  className = '',
  menuClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const alignmentClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top'
  };

  return (
    <div className={twMerge('relative inline-block text-left', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className={twMerge(
            'absolute mt-2 min-w-[180px] bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 focus:outline-none animate-scale-in',
            alignmentClasses[align],
            menuClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ icon: Icon, children, onClick, danger = false, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={twMerge(
        'w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5 transition-colors duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed',
        danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 text-current" />}
      <span>{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-slate-100" />;
}
