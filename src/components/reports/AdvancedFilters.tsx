import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Search, X, CalendarIcon } from "lucide-react";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface AdvancedFiltersProps {
  projects: Array<{ id: string; name: string }>;
  customers: Array<{ id: string; name: string }>;
  onFiltersChange: (filters: {
    search: string;
    projectId: string;
    customerId: string;
    dateRange: DateRange | undefined;
  }) => void;
}

export function AdvancedFilters({
  projects,
  customers,
  onFiltersChange,
}: AdvancedFiltersProps) {
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [open, setOpen] = useState(false);

  const handleChange = (updates: {
    search?: string;
    projectId?: string;
    customerId?: string;
    dateRange?: DateRange | undefined;
  }) => {
    const newFilters = {
      search: updates.search ?? search,
      projectId: updates.projectId ?? projectId,
      customerId: updates.customerId ?? customerId,
      dateRange: updates.dateRange ?? dateRange,
    };

    setSearch(newFilters.search);
    setProjectId(newFilters.projectId);
    setCustomerId(newFilters.customerId);
    setDateRange(newFilters.dateRange);

    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    handleChange({
      search: "",
      projectId: "",
      customerId: "",
      dateRange: undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by task name, project or customer..."
          value={search}
          onChange={(e) => handleChange({ search: e.target.value })}
          className="pl-10 w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Customer</Label>
          <Select
            value={customerId}
            onValueChange={(value) => handleChange({ customerId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Project</Label>
          <Select
            value={projectId}
            onValueChange={(value) => handleChange({ projectId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Date Range</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
                  "hover:bg-accent cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </span>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  handleChange({ dateRange: range });
                  setOpen(false);
                }}
                numberOfMonths={1}
                defaultMonth={dateRange?.from}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {(search || projectId || customerId || dateRange) && (
        <Button
          variant="ghost"
          className="h-10 px-3 lg:px-4"
          onClick={clearFilters}
        >
          <X className="h-4 w-4" />
          <span className="ml-2 hidden lg:inline-block">Clear Filters</span>
        </Button>
      )}
    </div>
  );
}
