import * as React from "react";

import { mergeClassNames } from "@/lib/utils";

/**
 * 44px tall with 16px text - large enough to hit accurately and large enough
 * that iOS does not zoom the viewport when it receives focus.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={mergeClassNames(
        "flex h-11 w-full rounded-md border border-input bg-white px-3 text-base text-ink transition-colors",
        "placeholder:text-g-600",
        "hover:border-ink",
        "disabled:cursor-not-allowed disabled:bg-g-100 disabled:opacity-60",
        "aria-[invalid=true]:border-flag aria-[invalid=true]:border-2",
        "file:mr-3 file:rounded-sm file:border-0 file:bg-g-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
