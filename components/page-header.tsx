import Link from "next/link";
import Reveal from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Crumb = { label: string; path?: string };

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  /** Narrow measure for text-heavy pages; full width for data pages. */
  width?: "prose" | "wide";
  /**
   * `compact` steps the title down to display-2. Long article titles set in
   * display-1 inside the narrow prose measure run to four or more lines.
   */
  size?: "default" | "compact";
  /**
   * Closing hairline. Set false when the page's first block is a `Section`,
   * which draws its own top rule — otherwise the two stack into what looks
   * like a rendering bug.
   */
  divider?: boolean;
  children?: React.ReactNode;
}

/**
 * Editorial page opening: a tracked sans eyebrow, a large serif title, and a
 * hairline running beneath it. No filled band — whitespace and the rule do the
 * separating that a coloured header did in the civic direction.
 */
const PageHeader = ({
  eyebrow,
  title,
  lead,
  crumbs,
  width = "wide",
  size = "default",
  divider = true,
  children,
}: PageHeaderProps) => (
  <div>
    <div
      className={cn(
        width === "prose" ? "shell-prose" : "shell",
        "pt-12 pb-14 sm:pt-16 sm:pb-16",
      )}
    >
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-g-600">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {crumb.path && !last ? (
                    <Link href={crumb.path} className="link-quiet text-g-600 hover:text-ink">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={last ? "text-ink" : undefined}>{crumb.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <Reveal>
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className={cn(size === "compact" ? "display-2" : "display-1", "max-w-4xl text-ink")}>
          {title}
        </h1>
      </Reveal>

      {lead && (
        <Reveal delay={90}>
          <p className="lead mt-7 max-w-2xl">{lead}</p>
        </Reveal>
      )}

      {children && <Reveal delay={150}>{children}</Reveal>}
    </div>

    {divider && (
      <div className="shell">
        <div className="h-0.5 bg-brand-green" aria-hidden="true" />
      </div>
    )}
  </div>
);

export default PageHeader;
