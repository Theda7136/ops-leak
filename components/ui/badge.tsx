import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        normal: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        watch: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        critical: "border-red-500/30 bg-red-500/10 text-red-300",
        low: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        neutral: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
