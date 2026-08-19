import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

import { mergeClassNames } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={mergeClassNames("border-b border-border", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

/**
 * A plus that rotates to a minus. Clearer than a chevron for readers who have
 * not learnt that a rotating arrow means "expandable".
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={mergeClassNames(
        "group flex flex-1 items-start justify-between gap-6 py-6 text-left font-serif text-[1.25rem] tracking-[-0.012em] text-ink transition-colors hover:text-g-600 [&[data-state=open]>span>svg]:rotate-45",
        className,
      )}
      {...props}
    >
      {children}
      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center text-g-600 transition-colors group-hover:text-ink">
        <Plus
          className="h-3.5 w-3.5 transition-transform duration-200"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={mergeClassNames("pb-7 pr-12", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
