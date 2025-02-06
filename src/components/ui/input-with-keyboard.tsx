import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { MobileKeyboard } from "./mobile-keyboard";

interface InputWithKeyboardProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onEnterPress?: () => void;
}

const InputWithKeyboard = React.forwardRef<
  HTMLInputElement,
  InputWithKeyboardProps
>(({ className, onEnterPress, ...props }, ref) => {
  const [showKeyboard, setShowKeyboard] = React.useState(false);
  const isMobile = React.useMemo(
    () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    [],
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mergedRef = (node: HTMLInputElement) => {
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
    if (inputRef) inputRef.current = node;
  };

  const handleKeyPress = (key: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = input.value;

    const newValue = value.slice(0, start) + key + value.slice(end);
    const newPosition = start + key.length;

    input.value = newValue;
    input.setSelectionRange(newPosition, newPosition);

    // Trigger change event
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
  };

  const handleBackspace = () => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = input.value;

    if (start === end && start > 0) {
      const newValue = value.slice(0, start - 1) + value.slice(end);
      const newPosition = start - 1;
      input.value = newValue;
      input.setSelectionRange(newPosition, newPosition);
    } else {
      const newValue = value.slice(0, start) + value.slice(end);
      input.value = newValue;
      input.setSelectionRange(start, start);
    }

    // Trigger change event
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
  };

  const handleEnter = () => {
    setShowKeyboard(false);
    onEnterPress?.();
  };

  return (
    <>
      <Input
        ref={mergedRef}
        className={cn("mobile-input", className)}
        onFocus={(e) => {
          if (isMobile) {
            e.target.blur(); // Prevent system keyboard
            setShowKeyboard(true);
          }
        }}
        readOnly={isMobile} // Prevent system keyboard on iOS
        {...props}
      />
      <MobileKeyboard
        open={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onEnter={handleEnter}
      />
    </>
  );
});

InputWithKeyboard.displayName = "InputWithKeyboard";

export { InputWithKeyboard };
