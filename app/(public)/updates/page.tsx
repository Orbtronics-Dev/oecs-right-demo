import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/page-header";
import Reveal from "@/components/motion/reveal";
import UpdateKindTag from "@/components/update-kind";
import {
  allUpdates,
  formatUpdateDate,
  kindPlural,
  readingMinutes,
  usedKinds,
} from "@/lib/updates";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Price orders, safety alerts, guidance, and events from the Consumer Affairs Division.",
};

export default function UpdatesPage() {
  const updates = allUpdates();
  const [lead, ...rest] = updates;
  const kinds = usedKinds();

  return (
    <>
      <PageHeader
        title="Updates"
        lead="Price orders, safety alerts, guidance, and events from the Consumer Affairs Division."
        crumbs={[{ label: "Home", path: "/" }, { label: "Updates" }]}
      />

      <div className="shell py-10 sm:py-14">
        {/* What is here, stated plainly rather than as filter chips that do
            nothing - there are five items, so a filter would be furniture. */}
        <Reveal>
          <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-g-600">
            This page carries{" "}
            <span className="text-ink">{updates.length} updates</span> covering{" "}
            {kinds.map((kind, index) => (
              <span key={kind}>
                {index > 0 && (index === kinds.length - 1 ? " and " : ", ")}
                <span className="text-ink">{kindPlural(kind)}</span>
              </span>
            ))}
            . Safety alerts are the ones to read first.
          </p>
        </Reveal>

        {/* Lead article - the newest gets the larger treatment */}
        <Reveal delay={80} className="mt-12 block">
          <article>
            <Link href={`/updates/${lead.slug}`} className="group block border-t-2 border-ink pt-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <UpdateKindTag kind={lead.kind} />
                <span className="h-3 w-px bg-g-300" aria-hidden="true" />
                <time dateTime={lead.date} className="text-[0.8125rem] text-g-600">
                  {formatUpdateDate(lead.date)}
                </time>
              </div>

              <h2 className="display-2 mt-5 max-w-3xl text-ink transition-colors group-hover:text-g-700">
                {lead.title}
              </h2>

              <p className="lead mt-5 max-w-2xl">{lead.summary}</p>

              <span className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink">
                Read this update
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
                <span className="text-g-600">· {readingMinutes(lead)} min read</span>
              </span>
            </Link>
          </article>
        </Reveal>

        {/* The rest, as an index */}
        <ul className="mt-16 border-t border-g-200" data-hairline>
          {rest.map((update, index) => (
            <li key={update.slug} className="border-b border-g-200" data-hairline>
              <Reveal delay={index * 60}>
                <article>
                  <Link href={`/updates/${update.slug}`} className="group block py-7">
                    <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                      <div className="lg:col-span-3">
                        <UpdateKindTag kind={update.kind} />
                        <time
                          dateTime={update.date}
                          className="mt-2 block text-[0.8125rem] text-g-600"
                        >
                          {formatUpdateDate(update.date)}
                        </time>
                      </div>

                      <div className="lg:col-span-9">
                        <div className="flex items-start justify-between gap-6">
                          <h2 className="display-3 max-w-2xl text-ink transition-colors group-hover:text-g-700">
                            {update.title}
                          </h2>
                          <ArrowRight
                            className="mt-1.5 h-5 w-5 shrink-0 text-g-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-g-600">
                          {update.summary}
                        </p>
                        <p className="mt-3 text-[0.8125rem] text-g-600">
                          {readingMinutes(update)} min read
                        </p>
                      </div>
                    </div>
                  </Link>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
