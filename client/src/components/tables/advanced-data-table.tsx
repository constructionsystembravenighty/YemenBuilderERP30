import { useState } from "react";
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
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GlassmorphicCard } from "@/components/glassmorphic-card";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  titleAr?: string;
  searchPlaceholder?: string;
  searchPlaceholderAr?: string;
  enableExport?: boolean;
  enableColumnVisibility?: boolean;
  onRowClick?: (row: TData) => void;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  title = "Data Table",
  titleAr = "جدول البيانات",
  searchPlaceholder = "Search...",
  searchPlaceholderAr = "بحث...",
  enableExport = true,
  enableColumnVisibility = true,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const exportToCSV = () => {
    const headers = columns.map((col: any) => col.header || col.accessorKey);
    const rows = table.getFilteredRowModel().rows.map(row => 
      row.getVisibleCells().map(cell => cell.getValue())
    );
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(String).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${title}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <GlassmorphicCard floating className="w-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-charcoal-text">{titleAr}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {table.getFilteredRowModel().rows.length} من أصل {data.length} عنصر
            </p>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-2">
            {enableExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="glass-input"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            )}
            
            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="glass-input">
                    <Eye className="h-4 w-4 ml-2" />
                    الأعمدة
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card">
                  <DropdownMenuLabel>إظهار الأعمدة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-reverse space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholderAr}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="glass-input pr-10"
            />
          </div>
          
          <Button variant="outline" size="sm" className="glass-input">
            <Filter className="h-4 w-4 ml-2" />
            فلتر
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-white/20 overflow-hidden backdrop-blur-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-white/20 hover:bg-white/5">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id} 
                        className="text-right text-charcoal-text font-semibold"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center justify-end space-x-reverse space-x-1"
                                : "flex items-center justify-end",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                {header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <div className="h-4 w-4 opacity-50">
                                    <ChevronUp className="h-2 w-4" />
                                    <ChevronDown className="h-2 w-4" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-white/20 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-right">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    لا توجد نتائج
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-reverse space-x-2 py-4">
          <div className="flex-1 text-sm text-gray-500">
            {table.getFilteredSelectedRowModel().rows.length} من{" "}
            {table.getFilteredRowModel().rows.length} صف(وف) محددة.
          </div>
          
          <div className="flex items-center space-x-reverse space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-reverse space-x-2">
              <p className="text-sm font-medium text-charcoal-text">صفوف لكل صفحة</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="glass-input h-8 w-[70px] text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-charcoal-text">
              صفحة {table.getState().pagination.pageIndex + 1} من{" "}
              {table.getPageCount()}
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex glass-input"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 glass-input"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 glass-input"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex glass-input"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

// Status Badge Component for table cells
export function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "نشط", className: "bg-green-100 text-green-800" };
      case "planning":
        return { label: "تخطيط", className: "bg-blue-100 text-blue-800" };
      case "completed":
        return { label: "مكتمل", className: "bg-gray-100 text-gray-800" };
      case "on_hold":
        return { label: "متوقف", className: "bg-yellow-100 text-yellow-800" };
      case "cancelled":
        return { label: "ملغى", className: "bg-red-100 text-red-800" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

// Priority Badge Component
export function PriorityBadge({ priority }: { priority: string }) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "critical":
        return { label: "حرجة", className: "bg-red-100 text-red-800" };
      case "high":
        return { label: "عالية", className: "bg-orange-100 text-orange-800" };
      case "medium":
        return { label: "متوسطة", className: "bg-yellow-100 text-yellow-800" };
      case "low":
        return { label: "منخفضة", className: "bg-green-100 text-green-800" };
      default:
        return { label: priority, className: "bg-gray-100 text-gray-800" };
    }
  };

  const config = getPriorityConfig(priority);
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}