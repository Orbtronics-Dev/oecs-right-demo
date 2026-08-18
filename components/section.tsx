import Reveal from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Editorial two-column section: a label rail on the left that pins while its
 * content scrolls past, and the content on the right. Collapses to a single
 * stacked column below `lg`, where sticky behaviour would only get in the way.
 */
const Section = ({
  title,
  description,
  action,
  index,
  children,
  className,
  headingLevel: Heading = "h2",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Optional editorial numbering — 1 renders as "01". */
  index?: number;
  children: React.ReactNode;
  className?: string;
  headingLevel?: "h2" | "h3";
}) => (
  <section className={cn("border-t-2 border-brand-green pt-8 sm:pt-10", className)} data-hairline>
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-4">
        <div className="lg:sticky-label">
          <Reveal>
            {index !== undefined && (
              <span className="eyebrow mb-4 block text-brand-green-ink" data-numeric="">
                {String(index).padStart(2, "0")}
              </span>
            )}
            <Heading className="display-2 text-ink">{title}</Heading>
            {description && (
              <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-g-600">
                {description}
              </p>
            )}
            {action && <div className="mt-6">{action}</div>}
          </Reveal>
        </div>
      </div>

      <div className="lg:col-span-8">{children}</div>
    </div>
  </section>
);

export default Section;
