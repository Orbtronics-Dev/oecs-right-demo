"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Check, FileText, Phone, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/page-header";
import Callout from "@/components/callout";
import { CaseStatusBadge } from "@/components/status-badge";
import { mergeClassNames } from "@/lib/utils";
import { lookupComplaint } from "../services/complaints";
import type { ComplaintPublic, CaseStatus } from "../types";

const SAMPLE_REFS = ["CP-2026-00142", "CP-2026-00138", "CP-2026-00135", "CP-2026-00150", "CP-2026-00145"];

const STAGES = ["Submitted", "Under Review", "Investigation", "Resolved"] as const;

const STAGE_MEANING: Record<CaseStatus, string> = {
  Submitted: "We have your complaint and it is queued for an officer.",
  "Under Review": "An officer is reading your complaint and gathering the facts.",
  Investigation: "We have contacted the business and are formally investigating.",
  Resolved: "The case is closed and an outcome has been recorded.",
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function ComplaintTracker() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ComplaintPublic | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const resultRegion = useRef<HTMLDivElement>(null);

  const search = async (ref?: string) => {
    const term = (ref ?? query).trim().toUpperCase();
    if (!term) {
      setResult(null);
      setNotFound(true);
      return;
    }
    setSearching(true);
    try {
      const data = await lookupComplaint(term);
      setResult(data);
      setNotFound(false);
    } catch (err) {
      setResult(null);
      setNotFound(true);
      if (err instanceof Error && err.name !== "NOT_FOUND") {
        console.error(err);
      }
    } finally {
      setSearching(false);
      requestAnimationFrame(() => resultRegion.current?.focus());
    }
  };

  const currentStage = result ? STAGES.indexOf(result.status) : -1;

  return (
    <>
      <PageHeader
        width="prose"
        title="Track a case"
        lead="Enter the case reference number we emailed you to see what stage your complaint has reached."
        crumbs={[{ label: "Home", path: "/" }, { label: "Track a case" }]}
      />

      <div className="shell-prose py-8 sm:py-10">
        <form onSubmit={(event) => { event.preventDefault(); search(); }}>
          <label htmlFor="case-ref" className="block text-[0.9375rem] font-semibold text-ink">
            Case reference number
          </label>
          <p id="case-ref-hint" className="mt-1 text-sm text-g-600">
            It looks like CP-2026-00142 and is in the confirmation email we sent you.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input id="case-ref" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="CP-2026-00142" aria-describedby="case-ref-hint" autoComplete="off" spellCheck={false} className="sm:flex-1" />
            <Button type="submit" className="sm:w-auto" disabled={searching}>
              <Search aria-hidden="true" />
              {searching ? "Searching…" : "Find my case"}
            </Button>
          </div>
        </form>

        <div className="mt-4 rounded-md border border-border bg-white px-4 py-3">
          <p className="text-sm text-g-600">
            <span className="font-semibold text-ink">Trying the prototype?</span> Use one of these sample references:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLE_REFS.map((ref) => (
              <button key={ref} type="button" onClick={() => { setQuery(ref); search(ref); }} className="rounded-sm border border-g-300 bg-g-50 px-2 py-1 text-[0.8125rem] font-medium text-ink transition-colors hover:border-ink hover:bg-g-100" data-numeric="">
                {ref}
              </button>
            ))}
          </div>
        </div>

        <div ref={resultRegion} tabIndex={-1} aria-live="polite" className="mt-8">
          {notFound && (
            <Callout variant="warning" title="We could not find that case reference">
              <p>Check for typing mistakes - the format is CP-2026-00142.</p>
              <p className="mt-2">
                If it still does not work, call us on{" "}
                <a href="tel:" className="font-semibold underline decoration-2 underline-offset-4">[telephone number]</a>{" "}
                and we will look it up for you.
              </p>
            </Callout>
          )}

          {result && (
            <article className="animate-rise">
              <div className="rounded-md border border-border bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
                  <div>
                    <p className="eyebrow">Case reference</p>
                    <h2 className="mt-1 text-[1.5rem] font-bold tracking-[-0.02em] text-ink" data-numeric="">{result.caseRef}</h2>
                  </div>
                  <CaseStatusBadge status={result.status} className="mt-1 px-2.5 py-1.5 text-sm" />
                </div>
                <dl className="grid gap-px bg-border sm:grid-cols-2">
                  {[
                    ["Date filed", formatDate(result.dateFiled)],
                    ["Type of problem", result.category],
                    ["Business", result.businessName],
                  ].map(([term, value]) => (
                    <div key={term} className="bg-white px-5 py-4">
                      <dt className="text-[0.75rem] font-semibold tracking-[0.03em] text-g-600 uppercase">{term}</dt>
                      <dd className="mt-1 text-[0.9375rem] font-medium text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <section className="mt-8">
                <h2 className="display-3 border-t-2 border-ink pt-4 text-ink">Progress</h2>
                <ol className="mt-5">
                  {STAGES.map((stage, index) => {
                    const done = index < currentStage;
                    const active = index === currentStage;
                    const pending = index > currentStage;
                    const last = index === STAGES.length - 1;
                    return (
                      <li key={stage} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className={mergeClassNames("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[0.8125rem] font-bold", done && "border-ok bg-ok text-white", active && "border-ink bg-ink text-white", pending && "border-g-300 bg-white text-g-600")}>
                            {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : index + 1}
                          </span>
                          {!last && <span className={mergeClassNames("w-0.5 flex-1", done ? "bg-ok" : "bg-g-300")} aria-hidden="true" />}
                        </div>
                        <div className={mergeClassNames("min-w-0 flex-1", last ? "pb-0" : "pb-7")}>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className={mergeClassNames("text-[1.0625rem] font-semibold", pending ? "text-g-600" : "text-ink")}>{stage}</h3>
                            {active && <span className="rounded-sm border border-g-300 bg-g-100 px-1.5 py-0.5 text-[0.75rem] font-semibold text-ink">Current stage</span>}
                            {done && <span className="sr-only">Completed</span>}
                            {pending && <span className="sr-only">Not started</span>}
                          </div>
                          <p className={mergeClassNames("mt-1 text-[0.9375rem] leading-relaxed", pending ? "text-g-600" : "text-g-600")}>{STAGE_MEANING[stage]}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {result.responseSummary && (
                <section className="mt-8">
                  <h2 className="display-3 border-t-2 border-ink pt-4 text-ink">Latest update from your officer</h2>
                  <div className="mt-4 rounded-md border border-border bg-white p-5">
                    <p className="text-[1.0625rem] leading-relaxed text-ink">{result.responseSummary}</p>
                  </div>
                </section>
              )}

              <section className="mt-8">
                <h2 className="display-3 border-t-2 border-ink pt-4 text-ink">What you can do</h2>
                <div className="mt-4 space-y-3">
                  {result.status === "Resolved" ? (
                    <Callout variant="success" title="This case is closed">If you are not satisfied with the outcome, you can ask for a review within 30 days, or take the matter to the Small Claims Court. Our handbook explains both routes.</Callout>
                  ) : (
                    <Callout variant="info" title="No action needed from you right now">We will email you when the stage changes. Most cases reach an outcome within 4 to 8 weeks.</Callout>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="secondary" onClick={() => window.print()}><Printer aria-hidden="true" />Print this page</Button>
                    <Button asChild variant="secondary"><Link href="/rights"><FileText aria-hidden="true" />Read about your rights</Link></Button>
                    <Button asChild variant="ghost"><a href="tel:"><Phone aria-hidden="true" />Call about this case</a></Button>
                  </div>
                </div>
              </section>
            </article>
          )}
        </div>

        {!result && !notFound && (
          <div className="mt-10 border-t border-border pt-6">
            <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
              <AlertCircle className="h-4 w-4 text-g-600" aria-hidden="true" />
              Lost your reference number?
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-g-600">
              Search your email for a message from no-reply@consumerprotection.example. If you cannot find it, call the Consumer Affairs Division on{" "}
              <a href="tel:" className="font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink">[telephone number]</a>{" "}
              with the date you filed and the name of the business.
            </p>
            <p className="mt-4">
              <Link href="/complaint" className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink">
                Have not filed yet? File a complaint<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
