import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

export function Thead({ ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-background text-left text-muted" {...props} />;
}

export function Tbody({ ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-border" {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-background/60", className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("px-4 py-3 text-xs font-medium uppercase tracking-wide", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-muted">{message}</div>
  );
}
