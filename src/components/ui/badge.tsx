import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
  secondary: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
  destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
  outline: "text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
