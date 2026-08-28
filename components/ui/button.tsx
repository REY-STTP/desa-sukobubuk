import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
    "transition-all duration-200 outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-sage-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
    // Default icon size (overrideable via size-* className on icon)
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
    // data-icon positional spacing (shadcn convention)
    "[&>[data-icon=inline-start]]:mr-1.5 [&>[data-icon=inline-end]]:ml-1.5",
    "active:translate-y-px",
  ].join(" "),
  {
    variants: {
      variant: {
        // Sage primary — aksi utama
        default:
          "bg-sage-600 text-stone-50 shadow-elevated-1 hover:bg-sage-700 hover:shadow-elevated-2",
        // Ember accent — untuk CTA konversi (Daftar, Beli)
        accent:
          "bg-ember-600 text-stone-50 shadow-elevated-1 hover:bg-ember-700 hover:shadow-elevated-2",
        // Stone secondary — aksi sekunder
        secondary:
          "bg-stone-100 text-stone-800 hover:bg-stone-200",
        // Outlined — alternatif
        outline:
          "border border-stone-300 bg-background text-stone-700 hover:bg-stone-50 hover:border-stone-400",
        // Ghost — aksi ringan
        ghost:
          "text-sage-700 hover:bg-sage-50",
        // Link — inline
        link:
          "text-sage-700 underline-offset-4 hover:underline hover:text-sage-800",
        // Destructive
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
      },
      size: {
        default: "h-10 px-4 gap-2",
        xs: "h-7 px-2.5 text-xs gap-1 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 text-sm gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-6 text-base gap-2",
        xl: "h-14 px-8 text-base gap-2.5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
