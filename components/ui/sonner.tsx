"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  AlertCircle,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" data-icon />,
        info: <InfoIcon className="size-4" data-icon />,
        warning: <TriangleAlertIcon className="size-4" data-icon />,
        error: <AlertCircle className="size-4" data-icon />,
        loading: <Loader2Icon className="size-4 animate-spin" data-icon />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-elevated-3",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-sage-600 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-stone-100 group-[.toast]:text-stone-700",
        },
      }}
      closeButton
      expand
      {...props}
    />
  )
}

export { Toaster }
