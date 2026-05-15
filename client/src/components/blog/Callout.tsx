import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

type CalloutType = "note" | "warning" | "tip";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const config: Record<CalloutType, { icon: typeof Info; border: string; bg: string; iconColor: string; label: string }> = {
  note: {
    icon: Info,
    border: "border-[#00FF9F]",
    bg: "bg-[#00FF9F]/6",
    iconColor: "text-[#00FF9F]",
    label: "Note",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-[#F59E0B]",
    bg: "bg-[#F59E0B]/6",
    iconColor: "text-[#F59E0B]",
    label: "Warning",
  },
  tip: {
    icon: Lightbulb,
    border: "border-[#00FF9F]",
    bg: "bg-[#00FF9F]/6",
    iconColor: "text-[#00FF9F]",
    label: "Tip",
  },
};

export function Callout({ type = "note", title, children }: CalloutProps) {
  const { icon: Icon, border, bg, iconColor, label } = config[type];

  return (
    <div className={`not-prose my-6 border-l-4 ${border} ${bg} px-4 py-3 rounded-r-lg`}>
      <div className={`flex items-center gap-1.5 mb-1 text-sm font-semibold ${iconColor}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        {title ?? label}
      </div>
      <div className="text-sm text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
