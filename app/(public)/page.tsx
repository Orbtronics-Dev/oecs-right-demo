import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskList, { type TaskItem } from "@/components/task-list";
import StatRow from "@/components/stat";
import Section from "@/components/section";
import Reveal from "@/components/motion/reveal";
import UpdateKindTag from "@/components/update-kind";
import { allUpdates, formatUpdateDate } from "@/lib/updates";

const tasks: TaskItem[] = [
  {
    icon: Clock,
    title: "File a complaint about a business",
    description:
      "Report unfair pricing, a faulty product, misleading advertising, or poor service. You get a case reference number straight away.",
    meta: "About 5 minutes",
    path: "/complaint",
  },
  {
    icon: Search,
    title: "Check if a price is too high",
    description:
      "Compare what a shop charged you against the legal maximum price set by your government.",
    meta: "342 products monitored",
    path: "/prices",
  },
  {
    icon: Eye,
    title: "Track a complaint you already filed",
    description: "Enter your case reference number to see what stage your complaint has reached.",
    meta: "Updated as officers work on your case",
    path: "/track",
  },
  {
    icon: BookOpen,
    title: "Find out what your rights are",
    description:
      "What you are entitled to when something goes wrong, and what the law requires businesses to do.",
    meta: "Plain-language guides and handbooks",
    path: "/rights",
  },
];

const stats = [
  { value: 1247, label: "Complaints filed", note: "Since January 2026" },
  { value: 1089, label: "Cases resolved", note: "An 87% resolution rate" },
  { value: 342, label: "Products monitored", note: "Prices surveyed every week" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero - the serif at full size on bare canvas. No band, no box, and
          nothing competing with the sentence. */}
      <section className="shell pt-14 pb-16 sm:pt-20 sm:pb-20">
        <Reveal>
          <p className="eyebrow">Consumer Affairs</p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="display-hero mt-7 max-w-5xl text-ink">
            Know your rights.
            <br />
            {/* g-500 is the lightest step allowed to carry text, and only at
                display size, where the 3:1 large-text floor applies. */}
            <span className="text-g-500">Make your voice heard.</span>
          </h1>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal delay={160} className="lg:col-span-7">
            <p className="lead max-w-xl">
              File a complaint against a business, check whether a price is legal, and follow your
              case from start to finish. Free, and online.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/complaint">
                  File a complaint
                  <ArrowRight
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/prices">Check prices</Link>
              </Button>
            </div>
          </Reveal>

          {/* Pull quote - the editorial voice, naming the problem this service
              exists to solve. */}
          <Reveal delay={240} className="lg:col-span-5">
            <blockquote className="border-l-2 border-brand-green pl-6">
              <p className="voice">
                &ldquo;Inflation peaked at 8.36% with no real-time monitoring, and no way to file a
                complaint online.&rdquo;
              </p>
              <footer className="mt-4 text-[0.8125rem] text-g-600">
                The problem this service was built to fix
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Photograph as a cinematic band rather than a hero inset: at this width
          the image gets room to breathe without competing with the headline, and
          it gives the page a break before the figures. Full colour, deliberately
          - it is the one saturated element on an otherwise monochrome page, so it
          reads as the focal point rather than as decoration. */}
      <section className="shell pb-20 sm:pb-24">
        <Reveal>
          <figure>
            <div className="overflow-hidden rounded-lg bg-g-100">
              <img
                src="/market-price-survey.jpg"
                alt="Market produce displayed on stalls with handwritten price tags."
                width={2200}
                height={940}
                className="aspect-[4/3] w-full object-cover sm:aspect-[7/3]"
              />
            </div>
            <figcaption className="mt-4 max-w-2xl text-[0.8125rem] leading-relaxed text-g-600">
              Consumer Affairs officers record shelf prices in markets and shops every week. Those
              records are what the price checker compares against.
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* Figures - oversized serif numerals on hairlines, counting up on reveal */}
      <section className="shell pb-24 sm:pb-28" aria-labelledby="figures-heading">
        <h2 id="figures-heading" className="sr-only">
          The service in numbers
        </h2>
        <StatRow items={stats} />
      </section>

      <div className="shell space-y-24 pb-8 sm:space-y-32">
        <Section
          index={1}
          title="What do you want to do?"
          description="Everything here is free, and you do not need an account."
        >
          <TaskList items={tasks} />
        </Section>

        <Section
          index={2}
          title="Latest updates"
          description="Price orders, safety alerts, and events from the Consumer Affairs Division."
          action={
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink link-quiet"
            >
              All updates
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <ul className="border-t border-g-200" data-hairline>
            {allUpdates().slice(0, 3).map((item, index) => (
                <li key={item.id} className="border-b border-g-200" data-hairline>
                  <Reveal delay={index * 70}>
                    <article>
                      <Link href={`/updates/${item.slug}`} className="group block py-7">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <UpdateKindTag kind={item.kind} />
                          <span className="h-3 w-px bg-g-300" aria-hidden="true" />
                          <time dateTime={item.date} className="text-[0.8125rem] text-g-600">
                            {formatUpdateDate(item.date)}
                          </time>
                        </div>

                        <div className="mt-4 flex items-start justify-between gap-6">
                          <h3 className="display-3 max-w-2xl text-ink transition-colors group-hover:text-g-700">
                            {item.title}
                          </h3>
                          <ArrowRight
                            className="mt-1.5 h-5 w-5 shrink-0 text-g-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-g-600">
                          {item.summary}
                        </p>
                      </Link>
                    </article>
                  </Reveal>
                </li>
              ))}
          </ul>
        </Section>

        <Section
          index={3}
          title="Before you file"
          description="The three things people most often ask before they get started."
        >
          <dl className="border-t border-g-200" data-hairline>
            {[
              {
                q: "It is free",
                a: "There is no charge to file a complaint or to have it investigated, and you do not need a lawyer.",
              },
              {
                q: "You get a reference number",
                a: "An officer is assigned to your case, and you can check its status at any time.",
              },
              {
                q: "Try the business first",
                a: "Most issues settle faster if you give the business a chance to fix it. Keep your receipt either way.",
              },
            ].map((item, index) => (
              <div key={item.q} className="border-b border-g-200" data-hairline>
                <Reveal delay={index * 70}>
                  <div className="grid gap-2 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8">
                    <dt className="font-serif text-[1.25rem] tracking-[-0.012em] text-ink">
                      {item.q}
                    </dt>
                    <dd className="text-[0.9375rem] leading-relaxed text-g-600">{item.a}</dd>
                  </div>
                </Reveal>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </>
  );
}
