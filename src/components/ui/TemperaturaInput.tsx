"use client";

import { cn } from "@/lib/utils";

const labels = ["Frio", "Morno", "Médio", "Quente", "Em Chamas"];

interface TemperaturaInputProps {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}

export function TemperaturaInput({ value, onChange, readOnly, size = "md" }: TemperaturaInputProps) {
  const icons = size === "sm" ? "text-base" : "text-xl";

  return (
    <div className="flex items-center gap-0.5" title={labels[value - 1]}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn(
            icons,
            "transition-all leading-none",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-125",
            n <= value ? "opacity-100" : "opacity-20"
          )}
          title={labels[n - 1]}
        >
          🔥
        </button>
      ))}
    </div>
  );
}
