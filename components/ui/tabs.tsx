import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { mergeClassNames } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/** Underlined tabs rather than a pill group - reads as navigation, not a filter. */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={mergeClassNames(
      "flex items-center gap-1 overflow-x-auto border-b border-border",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={mergeClassNames(
      "relative inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap px-3.5 text-[0.9375rem] font-medium text-g-600 transition-colors",
      "after:absolute after:inset-x-1 after:-bottom-px after:h-[3px] after:content-['']",
      "hover:text-ink",
      "data-[state=active]:font-semibold data-[state=active]:text-ink data-[state=active]:after:bg-ink",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={mergeClassNames("mt-6", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
