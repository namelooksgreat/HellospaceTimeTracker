import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function IOSModal({ open, onClose, children }: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setMounted(true);
    } else {
      document.body.style.overflow = "";
      setTimeout(() => setMounted(false), 300);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted && !open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999]",
        "transition-opacity duration-300",
        open ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm",
          "transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className={cn(
          "fixed inset-x-0 top-1/2 -translate-y-1/2 z-[9999]",
          "mx-4",
          "rounded-2xl",
          "bg-[#1C1C1E]",
          "transform transition-all duration-300 ease-out",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function IOSModalContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function IOSModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function IOSModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6", "flex justify-end gap-3", className)}
      {...props}
    />
  );
}

export function IOSModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-xl font-semibold text-white", className)}
      {...props}
    />
  );
}
