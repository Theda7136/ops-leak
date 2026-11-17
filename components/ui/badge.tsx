import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("badge", {
  variants: {
    variant: {
      normal: "badge-normal",
      watch: "badge-watch",
      critical: "badge-critical",
      low: "badge-low",
      neutral: "badge-neutral",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

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
