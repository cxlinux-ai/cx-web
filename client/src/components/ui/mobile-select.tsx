import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
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
      </DrawerTrigger>
      <DrawerContent className="bg-[#0a0a0f] border-white/10">
        <DrawerHeader className="border-b border-white/10">
          <DrawerTitle className="text-white text-center">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors",
                value === option.value
                  ? "bg-blue-500/20 text-white"
                  : "text-gray-300 hover:bg-white/5"
              )}
            >
              <span className="text-base">{option.label}</span>
              {value === option.value && (
                <Check className="h-5 w-5 text-blue-400" />
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full py-3 rounded-lg bg-white/5 text-gray-400 text-base font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
