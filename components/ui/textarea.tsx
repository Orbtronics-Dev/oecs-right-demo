import * as React from "react";

import { mergeClassNames } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={mergeClassNames(
        "flex min-h-[7rem] w-full rounded-md border border-input bg-white px-3 py-2.5 text-base leading-relaxed text-ink transition-colors",
        "placeholder:text-g-600 hover:border-ink",
        "disabled:cursor-not-allowed disabled:bg-g-100 disabled:opacity-60",
        "aria-[invalid=true]:border-2 aria-[invalid=true]:border-flag",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
