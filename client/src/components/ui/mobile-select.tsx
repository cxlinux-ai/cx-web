import { useState, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MobileSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  title?: string;
  className?: string;
  "data-testid"?: string;
}

export function MobileSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  title = "Select",
  className,
  "data-testid": testId,
}: MobileSelectProps) {
  const [open, setOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 sm:h-9 w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          !selectedOption && "text-gray-400",
          selectedOption && "text-white",
          className
        )}
        data-testid={testId}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
      </button>

      {open && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a0f]"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-4 py-4 text-left transition-colors",
                  value === option.value
                    ? "bg-blue-500/20 text-white"
                    : "text-gray-300 active:bg-white/10"
                )}
              >
                <span className="text-base">{option.label}</span>
                {value === option.value && (
                  <Check className="h-5 w-5 text-blue-400" />
                )}
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-white/10 safe-area-bottom">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-lg bg-white/10 text-gray-300 text-base font-medium active:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
