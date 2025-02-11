import * as React from "react";
import { cn } from "@/lib/utils";

interface IOSSheetProps {
  open?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export function IOSSheet({ open, onClose, children }: IOSSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [offsetY, setOffsetY] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY - offsetY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const newOffsetY = currentY - startY;
    if (newOffsetY < 0) return;
    setOffsetY(newOffsetY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetY > 100) {
      onClose?.();
    } else {
      setOffsetY(0);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div
        ref={sheetRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "bg-background border-t border-border/50 rounded-t-[20px] shadow-2xl",
          "transition-transform duration-300 ease-out",
          isDragging ? "transition-none" : "",
        )}
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {/* Handle */}
        <div
          className="absolute -top-1 left-0 right-0 h-8 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 mx-auto mt-3 bg-muted-foreground/25 rounded-full" />
        </div>

        {children}
      </div>
    </div>
  );
}

export function IOSSheetHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50">
      {children}
    </div>
  );
}

export function IOSSheetContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 sm:p-6">{children}</div>;
}

export function IOSSheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50 z-50">
      {children}
    </div>
  );
}

export function IOSSheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight">{children}</h2>;
}
