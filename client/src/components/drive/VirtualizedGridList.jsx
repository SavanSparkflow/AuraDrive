import React, { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function VirtualizedGridList({
  items = [],
  renderItem,
  viewMode = 'grid',
  gridCols = 5,
  estimateItemHeight = 180,
  className = ''
}) {
  const parentRef = useRef(null);

  // Group items into rows for grid view
  const rows = useMemo(() => {
    if (viewMode === 'list') {
      return items.map((item) => [item]);
    }

    const chunked = [];
    for (let i = 0; i < items.length; i += gridCols) {
      chunked.push(items.slice(i, i + gridCols));
    }
    return chunked;
  }, [items, viewMode, gridCols]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === 'list' ? 56 : estimateItemHeight),
    overscan: 5
  });

  // If items count is small (< 40), render regular layout for zero overhead
  if (items.length <= 40) {
    if (viewMode === 'list') {
      return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 ${className}`}>
          {items.map((item) => (
            <React.Fragment key={item._id}>
              {renderItem(item)}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
        {items.map((item) => (
          <React.Fragment key={item._id}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Virtualized rendering for high-performance large directories
  return (
    <div
      ref={parentRef}
      className={`max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin ${
        viewMode === 'list' ? 'bg-white rounded-2xl border border-slate-200/80 shadow-xs' : ''
      } ${className}`}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index] || [];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              {viewMode === 'list' ? (
                <div className="divide-y divide-slate-100">
                  {rowItems.map((item) => (
                    <React.Fragment key={item._id}>
                      {renderItem(item)}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                  {rowItems.map((item) => (
                    <React.Fragment key={item._id}>
                      {renderItem(item)}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
