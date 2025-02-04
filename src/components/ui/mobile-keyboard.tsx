import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Sheet, SheetContent } from "./sheet";

interface MobileKeyboardProps {
  open: boolean;
  onClose: () => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

const MobileKeyboard = ({
  open,
  onClose,
  onKeyPress,
  onBackspace,
  onEnter,
}: MobileKeyboardProps) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!isMobile) return null;

  const keyboardLayout = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", ".", "@"],
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="p-0 bg-muted border-t border-border shadow-lg"
      >
        <div className="fixed inset-x-0 bottom-0 w-full bg-muted p-1 pb-[env(safe-area-inset-bottom)]">
          {keyboardLayout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex justify-center gap-[1px] mb-[1px]"
              style={{
                paddingLeft:
                  rowIndex === 2 ? "20px" : rowIndex === 3 ? "40px" : "0",
              }}
            >
              {row.map((key) => (
                <Button
                  key={key}
                  variant="secondary"
                  className={cn(
                    "flex-1 min-w-0 h-[40px] text-base font-medium bg-background/95 hover:bg-background active:bg-accent/20 transition-colors rounded",
                    rowIndex === 0 && "bg-muted/80",
                  )}
                  onClick={() => onKeyPress(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-[1px]">
            <Button
              variant="secondary"
              className="flex-[2] h-[40px] text-sm font-medium bg-background/95 hover:bg-background active:bg-accent/20 transition-colors rounded"
              onClick={() => onKeyPress(" ")}
            >
              space
            </Button>
            <Button
              variant="secondary"
              className="w-[70px] h-[40px] text-sm font-medium bg-background/95 hover:bg-background active:bg-accent/20 transition-colors rounded"
              onClick={onBackspace}
            >
              ←
            </Button>
            <Button
              variant="default"
              className="w-[70px] h-[40px] text-sm font-medium active:bg-primary/90 transition-colors rounded"
              onClick={onEnter}
            >
              ↵
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { MobileKeyboard };
