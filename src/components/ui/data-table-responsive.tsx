
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T
  render?: (row: T) => React.ReactNode
  className?: string
  priority?: boolean // If true, shown prominently on mobile cards
}

interface DataTableResponsiveProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowId: (row: T) => string | number
  mobileConfig?: {
    title: (row: T) => React.ReactNode
    subtitle?: (row: T) => React.ReactNode
    description?: (row: T) => React.ReactNode
    badge?: (row: T) => React.ReactNode
    primaryFields?: (keyof T | string)[]
  }
  actions?: (row: T) => React.ReactNode
  emptyMessage?: string
}

export function DataTableResponsive<T>({
  data,
  columns,
  rowId,
  mobileConfig,
  actions,
  emptyMessage = "No se encontraron registros."
}: DataTableResponsiveProps<T>) {
  return (
    <div className="w-full space-y-4">
      {/* Desktop/Tablet View */}
      <div className="hidden sm:block border rounded-xl bg-card shadow-sm overflow-hidden transition-all duration-300">
        <div className="responsive-table-container">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                {columns.map((col, i) => (
                  <TableHead key={i} className={cn("font-bold text-foreground py-4", col.className)}>
                    {col.header}
                  </TableHead>
                ))}
                {actions && <TableHead className="text-right font-bold text-foreground py-4">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={rowId(row)} className="group hover:bg-muted/30 transition-colors">
                    {columns.map((col, i) => (
                      <TableCell key={i} className={cn("py-4", col.className)}>
                        {col.render ? col.render(row) : (row[col.accessorKey!] as React.ReactNode)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          {actions(row)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32 text-center text-muted-foreground italic">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {data.length > 0 ? (
          data.map((row) => (
            <Card key={rowId(row)} className="p-5 space-y-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-base leading-tight text-foreground">
                    {mobileConfig?.title ? mobileConfig.title(row) : (mobileConfig?.primaryFields?.[0] ? (row[mobileConfig.primaryFields[0] as keyof T] as React.ReactNode) : 'Registro')}
                  </div>
                  {mobileConfig?.subtitle && (
                    <div className="text-xs font-medium text-muted-foreground break-all">
                      {mobileConfig.subtitle(row)}
                    </div>
                  )}
                </div>
                {mobileConfig?.badge && (
                  <div className="shrink-0">
                    {mobileConfig.badge(row)}
                  </div>
                )}
              </div>

              {mobileConfig?.description && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                  {mobileConfig.description(row)}
                </div>
              )}

              {/* Mobile Fields Grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-2 border-t border-border/50">
                {columns
                  .filter(col => !col.priority) // Skip priority fields if handled in title/subtitle
                  .slice(0, 6) // Limit to 6 fields on mobile for brevity
                  .map((col, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                        {col.header}
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {col.render ? col.render(row) : (row[col.accessorKey!] as React.ReactNode)}
                      </div>
                    </div>
                  ))}
              </div>

              {actions && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-border/50">
                  {actions(row)}
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground italic text-sm">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}
