import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

interface AdminTableProps<T> {
  data: T[];
  columns: Array<{
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
  }>;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  className?: string;
}

export function AdminTable<T extends { id: string }>({
  data,
  columns,
  loading,
  loadingMessage = "Loading...",
  emptyMessage = "No items found",
  className,
}: AdminTableProps<T>) {
  return (
    <div
      className={cn(
        "border border-border/50 rounded-xl bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <LoadingState title="Loading" description={loadingMessage} />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="table-row-hover">
                {columns.map((column, index) => (
                  <TableCell key={index}>
                    {column.cell
                      ? column.cell(item)
                      : column.accessorKey
                        ? String(item[column.accessorKey])
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
