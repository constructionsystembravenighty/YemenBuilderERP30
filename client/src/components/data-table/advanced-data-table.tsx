import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ChevronDown, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Download,
  Filter,
  Search,
  Settings,
  RefreshCw
} from 'lucide-react';

export interface DataTableColumn<T> {
  accessorKey: keyof T;
  header: string;
  headerAr?: string;
  cell?: ({ row }: { row: any }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
}

export interface DataTableAction<T> {
  id: string;
  label: string;
  labelAr?: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  condition?: (row: T) => boolean;
}

export interface AdvancedDataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  onRowClick?: (row: T) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  onExport?: (data: T[], format: 'csv' | 'excel' | 'pdf') => void;
  onRefresh?: () => void;
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  emptyMessageAr?: string;
  className?: string;
  loading?: boolean;
}

export function AdvancedDataTable<T>({
  data,
  columns,
  actions = [],
  onRowClick,
  onRowSelect,
  onExport,
  onRefresh,
  searchable = true,
  filterable = true,
  selectable = false,
  exportable = true,
  pagination = true,
  pageSize = 10,
  emptyMessage = "No data available",
  emptyMessageAr = "لا توجد بيانات",
  className = '',
  loading = false
}: AdvancedDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Prepare columns with selection and actions
  const tableColumns = useMemo(() => {
    const cols: ColumnDef<T>[] = [];

    // Selection column
    if (selectable) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Data columns
    cols.push(...columns.map(col => ({
      accessorKey: col.accessorKey,
      header: ({ column }: any) => {
        const isArabic = col.headerAr;
        const headerText = isArabic ? col.headerAr : col.header;
        
        if (col.sortable !== false) {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 hover:bg-transparent text-right"
            >
              {headerText}
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-3 w-3" />
              ) : (
                <ArrowUpDown className="ml-2 h-3 w-3" />
              )}
            </Button>
          );
        }
        return <div className="text-right font-medium">{headerText}</div>;
      },
      cell: col.cell
    } as ColumnDef<T>)));

    // Actions column
    if (actions.length > 0) {
      cols.push({
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {actions
              .filter(action => !action.condition || action.condition(row.original))
              .map(action => (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => action.onClick(row.original)}
                  className="h-8 w-8 p-0"
                >
                  {action.icon}
                </Button>
              ))
            }
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return cols;
  }, [columns, actions, selectable]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Handle row selection
  React.useEffect(() => {
    if (onRowSelect && selectable) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelect(selectedRows);
    }
  }, [rowSelection, onRowSelect, selectable, table]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (onExport) {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const dataToExport = selectedRows.length > 0 
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original);
      onExport(dataToExport, format);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`advanced-data-table bg-white rounded-lg border ${className}`}>
      {/* Toolbar */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Global Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في جميع الحقول..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pr-10 w-64"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  الأعمدة
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnDef = columns.find(col => col.accessorKey === column.id);
                    const displayName = columnDef?.headerAr || columnDef?.header || column.id;
                    
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {displayName}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export */}
            {exportable && onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem onClick={() => handleExport('csv')}>
                    تصدير CSV
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem onClick={() => handleExport('excel')}>
                    تصدير Excel
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem onClick={() => handleExport('pdf')}>
                    تصدير PDF
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh */}
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                تحديث
              </Button>
            )}
          </div>
        </div>

        {/* Selected Rows Info */}
        {selectable && Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              تم تحديد {Object.keys(rowSelection).length} من {table.getFilteredRowModel().rows.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              إلغاء التحديد
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="relative overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-right">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="text-lg mb-2">📊</div>
                    <div className="font-medium">{emptyMessageAr}</div>
                    <div className="text-sm text-gray-400">{emptyMessage}</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} إلى{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              من {table.getFilteredRowModel().rows.length} نتيجة
            </div>
            
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  عرض {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              الأولى
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              السابقة
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">صفحة</span>
              <strong>
                {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
              </strong>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              التالية
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              الأخيرة
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}