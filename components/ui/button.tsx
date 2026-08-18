import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Pill actions. Ink is primary — in a near-monochrome system the strongest
 * available contrast is black on paper, and reserving the lemon accent for
 * emphasis elsewhere keeps it meaningful.
 *
 * Sizes still clear the 44px tap-target minimum at default and above.
 */
const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-[1.0625em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-ink text-white hover:bg-g-800",
        secondary: "border border-g-300 bg-transparent text-ink hover:border-ink",
        /* Alias for `secondary`, kept so the unused shadcn primitives that ship
           with this repo (carousel, pagination, alert-dialog) still compile. */
        outline: "border border-g-300 bg-transparent text-ink hover:border-ink",
        subtle: "bg-g-100 text-ink hover:bg-g-200",
        /* Lemon CTA. Ink text, not white: white on #78BE20 is 2.29:1, while
           ink on it is 8.66:1. */
        accent: "bg-brand-green text-ink hover:brightness-95",
        ghost: "text-g-700 hover:bg-g-100 hover:text-ink",
        destructive: "bg-flag text-white hover:brightness-90",
        /* On the ink footer / dark bands */
        inverse: "bg-white text-ink hover:bg-g-100",
        inverseOutline: "border border-white/35 text-white hover:border-white hover:bg-white/10",
        link: "h-auto rounded-none p-0 text-ink underline decoration-g-400 decoration-1 underline-offset-4 hover:decoration-ink",
      },
      size: {
        default: "h-11 px-5 text-[0.9375rem]",
        sm: "h-9 px-4 text-[0.8125rem]",
        lg: "h-[3.25rem] px-7 text-base",
        icon: "h-11 w-11",
        iconSm: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
