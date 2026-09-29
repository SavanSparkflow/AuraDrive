import React from 'react';
import { Tag as TagIcon, X } from 'lucide-react';

export default function TagChip({ tag, onRemove, onClick, size = 'sm', className = '' }) {
  const isSmall = size === 'xs' || size === 'sm';
  const tagColor = tag.color || '#7C3AED';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all ${
        onClick ? 'cursor-pointer hover:opacity-85' : ''
      } ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${className}`}
      style={{
        backgroundColor: `${tagColor}15`,
        color: tagColor,
        border: `1px solid ${tagColor}30`
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: tagColor }}
      />
      <span className="truncate max-w-[120px]">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="hover:opacity-75 p-0.5 -mr-1 rounded-full focus:outline-none"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}
