import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-card border border-borda bg-superficie p-6 shadow-suave", className)}
      {...props}
    />
  );
}
