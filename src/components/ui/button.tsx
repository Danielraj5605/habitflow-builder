import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        outline:
          "border-2 border-primary/20 bg-background hover:bg-accent hover:text-accent-foreground shadow-soft",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-hero text-white hover:shadow-glow border-0 font-bold tracking-wide",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]",
        floating: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium hover:shadow-glow rounded-full fixed bottom-6 right-6 z-50",
        habit: "bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground shadow-soft hover:shadow-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }

    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.02 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props as HTMLMotionProps<"button">}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
