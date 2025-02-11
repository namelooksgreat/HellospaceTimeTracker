import * as React from "react";
import { cn } from "@/lib/utils";

interface NativeDialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const NativeDialog = React.forwardRef<HTMLDialogElement, NativeDialogProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    const dialogRef = React.useRef<HTMLDialogElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => dialogRef.current!);

    React.useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const handleClose = () => {
        onClose?.();
      };

      dialog.addEventListener("close", handleClose);

      if (open) {
        dialog.showModal();
      } else {
        dialog.close();
      }

      return () => {
        dialog.removeEventListener("close", handleClose);
      };
    }, [open, onClose]);

    return (
      <dialog
        ref={dialogRef}
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "p-0 m-0 max-w-full max-h-full h-full w-full bg-transparent",
          "backdrop:bg-background/80",
          className,
        )}
        {...props}
      >
        {children}
      </dialog>
    );
  },
);

NativeDialog.displayName = "NativeDialog";

export { NativeDialog };
