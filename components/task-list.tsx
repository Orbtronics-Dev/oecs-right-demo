import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface TaskItem {
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: string;
  path: string;
}

/**
 * Editorial index rows. Each task is a numbered entry with a serif title, split
 * by hairlines — closer to a table of contents than to a set of cards. The whole
 * row is one target, and the arrow slides on hover so the affordance is felt
 * rather than drawn.
 */
const TaskList = ({ items, className }: { items: TaskItem[]; className?: string }) => (
  <ul className={cn("border-t border-g-200", className)} data-hairline>
    {items.map((item, index) => (
      <li key={item.path} className="border-b border-g-200" data-hairline>
        <Reveal delay={index * 70}>
          <Link href={item.path} className="group flex items-start gap-5 py-7 sm:gap-8">
            <span className="eyebrow mt-1.5 w-6 shrink-0 text-brand-green-ink tabular-nums" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-4">
                <span className="display-3 text-ink transition-colors group-hover:text-g-600">
                  {item.title}
                </span>
                <ArrowRight
                  className="mt-1.5 h-5 w-5 shrink-0 text-g-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink"
                  aria-hidden="true"
                />
              </span>

              <span className="mt-3 block max-w-xl text-[0.9375rem] leading-relaxed text-g-600">
                {item.description}
              </span>

              {item.meta && (
                <span className="mt-3 inline-flex items-center gap-2 text-[0.8125rem] text-g-600">
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.meta}
                </span>
              )}
            </span>
          </Link>
        </Reveal>
      </li>
    ))}
  </ul>
);

export default TaskList;
