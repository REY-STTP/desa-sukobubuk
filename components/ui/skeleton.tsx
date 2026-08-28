import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-stone-200/70", className)}
      {...props}
    />
  )
}

/** Skeleton untuk baris teks */
function SkeletonText({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />
}

/** Skeleton untuk judul/heading */
function SkeletonHeading({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("h-7 w-3/4 rounded-md", className)} {...props} />
}

/** Skeleton untuk avatar bulat */
function SkeletonAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("size-10 rounded-full", className)} {...props} />
}

/** Skeleton untuk image / card cover */
function SkeletonImage({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("aspect-video w-full rounded-xl", className)} {...props} />
}

/** Skeleton untuk 1 baris tabel */
function SkeletonRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)} {...props}>
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonHeading,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonRow,
}
