import React, { memo, useCallback } from "react";
import { useVirtualization } from "@/hooks/useVirtualization";
import TimeEntry from "./TimeEntry";
import { ScrollArea } from "./ui/scroll-area";
import { useRenderOptimization } from "@/hooks/useRenderOptimization";
import { createPropsComparison } from "@/lib/utils/component-optimization";
import { TimeEntry as TimeEntryType } from "@/types";

interface TimeEntryListVirtualizedProps {
  entries: TimeEntryType[];
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
  className?: string;
  itemHeight?: number;
}

const TIME_ENTRY_HEIGHT = 100; // Approximate height of a time entry in pixels

function TimeEntryListVirtualized({
  entries,
  onEditEntry,
  onDeleteEntry,
  className = "",
  itemHeight = TIME_ENTRY_HEIGHT,
}: TimeEntryListVirtualizedProps) {
  // Track render performance
  useRenderOptimization("TimeEntryListVirtualized");

  // Use virtualization for better performance with large lists
  const { virtualItems, totalHeight, containerRef, isScrolling } =
    useVirtualization(entries, {
      itemHeight,
      overscan: 5, // Number of items to render above/below the visible area
    });

  // Memoize handlers to prevent unnecessary re-renders
  const handleEdit = useCallback(
    (id: string) => {
      onEditEntry?.(id);
    },
    [onEditEntry],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDeleteEntry?.(id);
    },
    [onDeleteEntry],
  );

  return (
    <div
      ref={containerRef}
      className={`h-[calc(100vh-16rem)] overflow-auto relative ${className}`}
      style={{ willChange: isScrolling ? "transform" : "auto" }}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map(({ index, offsetTop, item }) => (
          <div
            key={item.id}
            style={{
              position: "absolute",
              top: 0,
              transform: `translateY(${offsetTop}px)`,
              width: "100%",
              height: itemHeight,
            }}
          >
            <TimeEntry
              id={item.id}
              taskName={item.task_name}
              projectName={item.project?.name || ""}
              duration={item.duration}
              startTime={item.start_time}
              projectColor={item.project?.color || "#94A3B8"}
              tags={item.tags || []}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          </div>
        ))}
      </div>

      {/* Show loading indicator when scrolling for better UX */}
      {isScrolling && entries.length > 50 && (
        <div className="fixed bottom-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium opacity-70">
          Scrolling...
        </div>
      )}
    </div>
  );
}

// Use custom comparison to prevent unnecessary re-renders
const propsComparison = createPropsComparison<TimeEntryListVirtualizedProps>([
  "entries",
  "onEditEntry",
  "onDeleteEntry",
]);

export default memo(TimeEntryListVirtualized, propsComparison);
