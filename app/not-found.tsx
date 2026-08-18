import Link from "next/link";
import { BookOpen, Eye, FileText, Phone, Search } from "lucide-react";
import PageHeader from "@/components/page-header";
import TaskList, { type TaskItem } from "@/components/task-list";

/** A 404 that recovers the reader rather than just apologising to them. */
const routes: TaskItem[] = [
  {
    icon: FileText,
    title: "File a complaint about a business",
    description: "Report unfair pricing, a faulty product, or poor service.",
    path: "/complaint",
  },
  {
    icon: Search,
    title: "Check if a price is too high",
    description: "Compare a shop's price against the legal maximum.",
    path: "/prices",
  },
  {
    icon: Eye,
    title: "Track a complaint you already filed",
    description: "Enter your case reference number to see its progress.",
    path: "/track",
  },
  {
    icon: BookOpen,
    title: "Find out what your rights are",
    description: "Plain-language guides to your consumer protections.",
    path: "/rights",
  },
];

export default function NotFound() {
  return (
    <>
      <PageHeader
        width="prose"
        eyebrow="Error 404"
        title="We cannot find that page"
        lead="The link may be out of date, or the address may have been typed incorrectly. Nothing you have submitted has been lost."
      />

      <div className="shell-prose py-8 sm:py-10">
        <h2 className="text-[1.0625rem] font-semibold text-ink">Where would you like to go?</h2>
        <TaskList items={routes} className="mt-4" />

        <div className="mt-8 border-t border-border pt-6">
          <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
            <Phone className="h-4 w-4 text-g-600" aria-hidden="true" />
            Still stuck?
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-g-600">
            Call the Consumer Affairs Division on{" "}
            <a
              href="tel:"
              className="font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink"
            >
              [telephone number]
            </a>
           , or{" "}
            <Link
              href="/"
              className="font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink"
            >
              start again from the home page
            </Link>.
          </p>
        </div>
      </div>
    </>
  );
}
