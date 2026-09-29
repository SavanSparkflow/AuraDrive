import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconRight: IconRight,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-brand-500/20 focus:ring-brand-500',
    secondary: 'bg-brand-100 hover:bg-brand-200 text-brand-700 focus:ring-brand-400',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm focus:ring-brand-500',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    dangerGhost: 'hover:bg-rose-50 text-rose-600 hover:text-rose-700 focus:ring-rose-400'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
}
