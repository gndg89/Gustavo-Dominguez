import { cn } from "@/lib/cn";

export function FormMessage({
  error,
  className,
}: {
  error?: string | null;
  className?: string;
}) {
  if (!error) return null;
  return (
    <p className={cn("rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger", className)}>
      {error}
    </p>
  );
}
