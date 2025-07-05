import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { PERFORMANCE_CONFIG, detectDevice, performanceMonitor } from '../../lib/performance-config';
import { formatCurrency } from '../../lib/currency';

interface VirtualDataGridProps<T> {
  data: T[];
  columns: GridColumn<T>[];
  onRowClick?: (item: T) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  className?: string;
}

interface GridColumn<T> {
  key: keyof T;
  title: string;
  width: number;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export function VirtualDataGrid<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  onSort,
  loading,
  className = ''
}: VirtualDataGridProps<T>) {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<number>(-1);
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Device detection for optimal sizing
  const device = useMemo(() => detectDevice(), []);
  
  // Calculate optimal row height based on device
  const rowHeight = useMemo(() => {
    if (device.isMobile) return 60;
    if (device.isTablet) return 70;
    if (device.is4K) return 90;
    if (device.is8K) return 120;
    return 80;
  }, [device]);
  
  // Calculate grid height
  const gridHeight = useMemo(() => {
    const maxHeight = device.height * 0.7; // 70% of viewport
    const calculatedHeight = Math.min(data.length * rowHeight, maxHeight);
    return Math.max(calculatedHeight, 400);
  }, [device.height, data.length, rowHeight]);
  
  // Optimized sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'ar');
      } else {
        return bStr.localeCompare(aStr, 'ar');
      }
    });
  }, [data, sortColumn, sortDirection]);
  
  // Optimized row renderer with memoization
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = sortedData[index];
    const isHovered = hoveredRow === index;
    
    return (
      <div
        style={style}
        className={`
          flex gap-4 px-4 items-center
          border-b border-white/10 transition-all duration-150
          hover:bg-white/5 cursor-pointer
          ${isHovered ? 'bg-white/5 shadow-lg' : ''}
          ${index % 2 === 0 ? 'bg-white/2' : ''}
        `}
        onClick={() => onRowClick?.(item)}
        onMouseEnter={() => setHoveredRow(index)}
        onMouseLeave={() => setHoveredRow(-1)}
        dir="rtl"
      >
        {columns.map((column) => (
          <div key={String(column.key)} className="flex-1 text-sm truncate">
            {column.render 
              ? column.render(item[column.key], item)
              : formatCellValue(item[column.key])
            }
          </div>
        ))}
      </div>
    );
  }, [sortedData, columns, hoveredRow, onRowClick]);
  
  // Enhanced cell value formatting
  const formatCellValue = (value: any) => {
    if (typeof value === 'number') {
      if (value > 1000) {
        return formatCurrency(value);
      }
      return value.toLocaleString('ar');
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString('ar-SA');
    }
    
    return String(value || '');
  };
  
  // Performance monitoring
  useEffect(() => {
    performanceMonitor.startMonitoring();
  }, []);
  
  // Loading skeleton
  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className={`ultra-responsive-grid ${className}`}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-white/10 backdrop-blur-md border-b border-white/20">
        {columns.map((column) => (
          <button
            key={String(column.key)}
            className={`
              flex-1 text-right font-semibold text-sm transition-all duration-150
              hover:text-blue-300 flex items-center justify-end gap-2
              ${sortColumn === column.key ? 'text-blue-400' : 'text-white/90'}
              ${column.sortable ? 'cursor-pointer' : ''}
            `}
            onClick={column.sortable ? () => {
              const newDirection = sortColumn === String(column.key) && sortDirection === 'asc' ? 'desc' : 'asc';
              setSortColumn(String(column.key));
              setSortDirection(newDirection);
              onSort?.(String(column.key), newDirection);
            } : undefined}
            disabled={!column.sortable}
          >
            {column.title}
            {column.sortable && sortColumn === String(column.key) && (
              <span className="text-xs">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Virtual List */}
      <List
        ref={listRef}
        height={gridHeight}
        width="100%"
        itemCount={sortedData.length}
        itemSize={rowHeight}
        overscanCount={PERFORMANCE_CONFIG.VIRTUAL_BUFFER_SIZE}
        className="ultra-smooth-scroll"
      >
        {Row}
      </List>
      
      {/* Performance Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded">
          FPS: {performanceMonitor.getFPS()} | Items: {sortedData.length}
        </div>
      )}
      
      <style jsx>{`
        .ultra-smooth-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .ultra-smooth-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .ultra-smooth-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .ultra-smooth-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .ultra-smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .ultra-responsive-grid {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        @media (prefers-reduced-motion: no-preference) {
          .ultra-responsive-grid * {
            transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
          }
        }

        @media (min-resolution: 120dpi) {
          .ultra-responsive-grid {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}