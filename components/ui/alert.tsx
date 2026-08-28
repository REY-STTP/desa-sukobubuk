import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-xl border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
        // Sage — success / positive
        success:
          "border-sage-200 bg-sage-50 text-sage-800 [&>svg]:text-sage-600 *:data-[slot=alert-description]:text-sage-700/90",
        // Ember — error / negative
        error:
          "border-ember-200 bg-ember-50 text-ember-800 [&>svg]:text-ember-600 *:data-[slot=alert-description]:text-ember-700/90",
        // Amber — warning
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600 *:data-[slot=alert-description]:text-amber-700/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** Icon yang sesuai untuk tiap variant. Bisa di-override manual via prop `icon`. */
const ALERT_ICONS: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, React.ComponentType<{ className?: string }>> = {
  default: InfoIcon,
  destructive: AlertCircleIcon,
  success: CheckCircle2Icon,
  error: AlertCircleIcon,
  warning: TriangleAlertIcon,
}

function Alert({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & {
  /** Optional custom icon. Default = icon sesuai variant. */
  icon?: React.ReactNode
}) {
  const Icon = ALERT_ICONS[variant ?? "default"]
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon ?? <Icon />}
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
