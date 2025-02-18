import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  className,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(date);
  const [open, setOpen] = React.useState(false);

  // Update the time
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":");
    const newDate = new Date(selectedDate);
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    setSelectedDate(newDate);
    setDate(newDate);
  };

  // Update the date
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setSelectedDate(newDate);
      setDate(newDate);
      setOpen(false); // Close the calendar after selection
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "flex-1 justify-start text-left font-normal",
              "bg-background/50 hover:bg-accent/50 transition-all duration-150",
              "rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={format(selectedDate, "HH:mm")}
        onChange={handleTimeChange}
        className={cn(
          "w-[120px]",
          "bg-background/50 hover:bg-accent/50 transition-all duration-150",
          "rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
        )}
      />
    </div>
  );
}
