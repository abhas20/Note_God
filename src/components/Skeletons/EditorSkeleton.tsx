import { Skeleton } from "@/components/ui/skeleton";

export default function EditorSkeleton() {
  return (
    <div className="border-border bg-background w-full max-w-4xl rounded-xl border p-4 shadow-sm">
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="ml-auto h-8 w-16" />
      </div>

      {/* Title */}
      <Skeleton className="mb-4 h-6 w-1/3" />

      {/* Editor lines */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}
