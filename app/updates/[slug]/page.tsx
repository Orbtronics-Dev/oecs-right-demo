import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Printer, Search } from "lucide-react";
import PageHeader from "@/components/page-header";
import Reveal from "@/components/motion/reveal";
import UpdateBody from "@/components/update-body";
import UpdateKindTag from "@/components/update-kind";
import { Button } from "@/components/ui/button";
import { updates } from "@/data/mockData";
import { adjacentUpdates, findUpdate, formatUpdateDate, readingMinutes } from "@/lib/updates";

/** Every article is known at build time, so all of them prerender. */
export function generateStaticParams() {
  return updates.map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const update = findUpdate(slug);
  if (!update) return { title: "Update not found" };

  return {
    title: update.title,
    description: update.summary,
    openGraph: {
      title: update.title,
      description: update.summary,
      type: "article",
      publishedTime: update.date,
    },
  };
}

export default async function UpdatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const update = findUpdate(slug);

  // An unknown slug is a 404, not an empty article.
  if (!update) notFound();

  const { newer, older } = adjacentUpdates(slug);

  return (
    <>
      {/* No eyebrow: the byline row below already carries the kind, with its
          icon and its colour. */}
      <PageHeader
        title={update.title}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Updates", path: "/updates" },
          { label: update.kind },
        ]}
        width="prose"
        size="compact"
        divider={false}
      />

      <article className="shell-prose pb-16">
        {/* Byline row: who it applies to, when, how long it takes to read */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-g-200 py-4">
            <UpdateKindTag kind={update.kind} />
            <span className="h-3 w-px bg-g-300" aria-hidden="true" />
            <time dateTime={update.date} className="text-[0.8125rem] text-g-600">
              {formatUpdateDate(update.date)}
            </time>
            <span className="h-3 w-px bg-g-300" aria-hidden="true" />
            <span className="text-[0.8125rem] text-g-600">
              {readingMinutes(update)} min read
            </span>
          </div>
        </Reveal>

        {/* Standfirst, at reading-lead size */}
        <Reveal delay={70}>
          <p className="lead mt-8 text-g-800">{update.summary}</p>
        </Reveal>

        <Reveal delay={120}>
          <UpdateBody blocks={update.body} />
        </Reveal>

        {/* Act on it — every update should lead somewhere useful */}
        <Reveal>
          <aside className="mt-14 rounded-lg bg-ink p-7 text-white sm:p-8">
            <h2 className="font-serif text-[1.5rem] leading-tight tracking-[-0.014em]">
              Something not right with a purchase?
            </h2>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-white/70">
              Filing a complaint is free, and you get a reference number straight away.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="inverse">
                <Link href="/complaint">
                  <FileText aria-hidden="true" />
                  File a complaint
                </Link>
              </Button>
              <Button asChild variant="inverseOutline">
                <Link href="/prices">
                  <Search aria-hidden="true" />
                  Check prices
                </Link>
              </Button>
            </div>
          </aside>
        </Reveal>

        {/* Utility row */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-g-200 pt-6">
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink link-quiet"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All updates
          </Link>
          <span className="inline-flex items-center gap-2 text-[0.8125rem] text-g-600">
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            This page is laid out to print on one sheet where the article allows
          </span>
        </div>

        {/* Previous / next */}
        {(newer || older) && (
          <nav aria-label="More updates" className="mt-12 grid gap-px bg-g-200 sm:grid-cols-2">
            {older ? (
              <Link href={`/updates/${older.slug}`} className="group bg-canvas py-6 pr-6">
                <span className="eyebrow flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  Older
                </span>
                <span className="mt-3 block font-serif text-[1.125rem] leading-snug text-ink transition-colors group-hover:text-g-700">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span />
            )}

            {newer && (
              <Link
                href={`/updates/${newer.slug}`}
                className="group bg-canvas py-6 sm:pl-6 sm:text-right"
              >
                <span className="eyebrow flex items-center gap-2 sm:justify-end">
                  Newer
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className="mt-3 block font-serif text-[1.125rem] leading-snug text-ink transition-colors group-hover:text-g-700">
                  {newer.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </article>
    </>
  );
}
