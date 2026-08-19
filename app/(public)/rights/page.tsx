import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Coins,
  Download,
  FileText,
  MessageSquareWarning,
  Play,
  ShieldCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Section from "@/components/section";
import Callout from "@/components/callout";
import Reveal from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Know your rights",
  description:
    "What you are entitled to as a consumer, and what the law requires businesses to do.",
};

/** The five rights, stated as things the reader owns rather than as legal clauses. */
const rights = [
  {
    icon: ShieldCheck,
    title: "Safe products",
    body: "Anything sold to you must be safe to use and meet quality standards. Unsafe goods can be seized and the seller fined.",
  },
  {
    icon: BadgeCheck,
    title: "Honest information",
    body: "Adverts, labels, and shelf prices must be truthful. A business cannot advertise one price and charge another.",
  },
  {
    icon: Coins,
    title: "Fair prices",
    body: "Price-controlled goods have a legal maximum price. Charging above it is an offence, not a business decision.",
  },
  {
    icon: Ban,
    title: "A remedy when things go wrong",
    body: "If goods are faulty or a service was not delivered, you are entitled to a refund, repair, or replacement.",
  },
  {
    icon: MessageSquareWarning,
    title: "To complain without fear",
    body: "You can file a complaint free of charge, and a business may not retaliate against you for doing so.",
  },
];

const faqs = [
  {
    q: "What is consumer protection?",
    a: "Consumer protection is the set of laws that safeguard people who buy goods and services from unfair business practices, defective products, and misleading advertising. A Consumer Affairs Division enforces these laws and educates the public about their rights.",
  },
  {
    q: "How do I file a complaint?",
    a: "File online through this portal using the 'File a complaint' link. You will need the name of the business, a description of what happened, and your contact details. Evidence such as receipts or photographs helps considerably. You will receive a case reference number immediately. You can also file in person at any Consumer Affairs office, or by phone if you would prefer an officer to complete the form with you.",
  },
  {
    q: "Does it cost anything to complain?",
    a: "No. Filing a complaint and having it investigated is free. You do not need a lawyer, and there is no fee at any stage of the process.",
  },
  {
    q: "What are price control laws?",
    a: "Price control laws let a government set the maximum retail price for essential goods such as basic foods, fuel, and household necessities. They protect consumers from price gouging, particularly during shortages or emergencies. A business that charges above the controlled price may be fined and prosecuted.",
  },
  {
    q: "How long does it take to resolve a complaint?",
    a: "Most complaints receive an initial response within 5 to 7 business days. Straightforward cases are often settled within 2 to 4 weeks through mediation. Cases that need an inspection or a formal investigation can take 6 to 8 weeks. You can check your case status at any time using your reference number.",
  },
  {
    q: "Can I complain anonymously?",
    a: "You may submit a complaint with limited personal information, but it makes the case much harder to investigate and we will not be able to tell you the outcome. We encourage you to give your contact details - they are not shared with the business without your agreement.",
  },
  {
    q: "What if I am not happy with the outcome?",
    a: "You can ask for your case to be reviewed within 30 days of the decision. If you remain dissatisfied, you may take the matter to the Small Claims Court, which is designed to be used without a lawyer. Our Small Claims Court guide explains the procedure and the current monetary limits.",
  },
];

const resources = [
  {
    name: "Consumer Rights Handbook 2026",
    description: "The complete guide to your rights, in plain language.",
    format: "PDF",
    size: "2.4 MB",
  },
  {
    name: "Price Control Order - Gazette",
    description: "The current legal maximum prices for controlled goods.",
    format: "PDF",
    size: "1.1 MB",
  },
  {
    name: "How to file a complaint - step by step",
    description: "A printable one-page walkthrough of the process.",
    format: "PDF",
    size: "890 KB",
  },
  {
    name: "Small Claims Court procedures",
    description: "What to do if you want to take a matter to court yourself.",
    format: "PDF",
    size: "1.6 MB",
  },
];

export default function KnowYourRightsPage() {
  return (
    <>
      <PageHeader
        title="Know your rights"
        lead="What you are entitled to when you buy something, and what the law requires businesses to do."
        crumbs={[{ label: "Home", path: "/" }, { label: "Know your rights" }]}
        divider={false}
      />

      <div className="shell space-y-24 py-8 sm:space-y-32 sm:py-10">
        {/* The five rights, as a numbered editorial list rather than a card grid:
            these are five statements to be read in order, not five tiles to be
            scanned. */}
        <Section
          index={1}
          title="Your five consumer rights"
          description="These apply whether you bought in a shop, online, or over the phone."
        >
          <ol className="border-t border-g-200" data-hairline>
            {rights.map((right, index) => (
              <li key={right.title} className="border-b border-g-200" data-hairline>
                <Reveal delay={index * 60}>
                  <div className="grid gap-3 py-7 sm:grid-cols-[2.5rem_1fr] sm:gap-6">
                    <span className="eyebrow pt-2 tabular-nums" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="display-3 flex items-center gap-3 text-ink">
                        <right.icon
                          className="h-5 w-5 shrink-0 text-g-500"
                          aria-hidden="true"
                        />
                        {right.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-g-600">
                        {right.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={120}>
            <div className="mt-10 flex flex-col items-start gap-5 rounded-lg bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-[1.5rem] leading-tight tracking-[-0.014em]">
                  Has a business broken any of these?
                </p>
                <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-white/70">
                  We will take it up on your behalf, free of charge.
                </p>
              </div>
              <Button asChild variant="inverse" className="shrink-0">
                <Link href="/complaint">
                  File a complaint
                  <ArrowRight
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </div>
          </Reveal>
        </Section>

        {/* FAQ */}
        <Section
          index={2}
          title="Common questions"
          description="If your question is not answered here, call the Consumer Affairs Division on [telephone number]."
        >
          <div className="border-t border-g-200" data-hairline>
            <Accordion type="multiple">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.q} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>
                    <p className="prose-editorial">{faq.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>

        {/* Resources */}
        <Section
          index={3}
          title="Guides and documents"
          description="Free to download, print, and share. Copies are also available at any Consumer Affairs office."
        >
          <ul className="border-t border-g-200" data-hairline>
            {resources.map((resource) => (
              <li key={resource.name}>
                <a
                  href="#"
                  className="group flex items-center gap-5 border-b border-g-200 py-6 transition-colors"
                  aria-label={`${resource.name} - ${resource.format}, ${resource.size}`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-g-300 bg-g-100 text-g-700"
                    aria-hidden="true"
                  >
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.0625rem] font-semibold text-ink underline decoration-g-400 decoration-1 underline-offset-4 group-hover:decoration-ink group-hover:decoration-2">
                      {resource.name}
                    </span>
                    <span className="mt-0.5 block text-[0.9375rem] text-g-600">
                      {resource.description}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] text-g-600">
                      {resource.format} · {resource.size}
                    </span>
                  </span>
                  <Download
                    className="h-5 w-5 shrink-0 text-g-400 transition-colors group-hover:text-ink"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {/* Video */}
        <Section
          index={4}
          title="Watch: your consumer rights explained"
          description="A short introduction covering what to do when a purchase goes wrong."
        >
          <div className="max-w-3xl">
            <button
              type="button"
              className="group relative block w-full overflow-hidden rounded-md border border-border bg-ink text-left"
              aria-label="Play video: Know your consumer rights, 4 minutes 32 seconds"
            >
              <span className="flex aspect-video flex-col items-center justify-center gap-4 p-6">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink transition-transform group-hover:scale-105"
                  aria-hidden="true"
                >
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                </span>
                <span className="text-center">
                  <span className="block text-[1.0625rem] font-semibold text-white">
                    Know your consumer rights
                  </span>
                  <span className="mt-1 block text-[0.9375rem] text-white/70" data-numeric="">
                    4 min 32 sec · English, with subtitles
                  </span>
                </span>
              </span>
            </button>
          </div>
        </Section>

        <Callout variant="info" title="Are you a business?" className="max-w-3xl">
          <p>
            Understanding your obligations prevents most complaints. Our guidance for traders covers
            price display rules, warranty duties, and refund policies.
          </p>
        </Callout>
      </div>
    </>
  );
}
