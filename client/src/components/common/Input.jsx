import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    iconRight: IconRight,
    onRightIconClick,
    className = '',
    containerClassName = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={twMerge('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm',
              Icon && 'pl-10',
              IconRight && 'pr-10',
              error && 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20'
            ),
            className
          )}
          {...props}
        />

        {IconRight && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center"
          >
            <IconRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
