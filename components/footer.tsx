import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ServiceMark from "@/components/service-mark";
import EuFlag from "@/components/eu-flag";
import Reveal from "@/components/motion/reveal";

const serviceLinks = [
  { label: "File a complaint", path: "/complaint" },
  { label: "Check prices", path: "/prices" },
  { label: "Track a case", path: "/track" },
  { label: "Know your rights", path: "/rights" },
  { label: "Updates", path: "/updates" },
  { label: "Officer portal", path: "/officer-login" },
];

const Footer = () => (
  <footer data-on-ink className="mt-32 bg-ink text-white">
    <div className="shell py-16 sm:py-20">
      {/* Closing statement — the serif gets the last word */}
      <Reveal>
        <p className="max-w-3xl font-serif text-[clamp(1.75rem,1.3rem+2.2vw,2.75rem)] leading-[1.1] tracking-[-0.018em] text-white">
          Free to use. Free to complain.
          <span className="text-white/45"> For every consumer.</span>
        </p>
      </Reveal>

      <div className="mt-16 h-0.5 bg-brand-green" />

      <div className="mt-12 grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <ServiceMark tone="dark" />
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-white/55">
            A design sample for a national consumer protection service. Branding, contact details
            and content are placeholders.
          </p>
        </div>

        <nav aria-labelledby="footer-services" className="lg:col-span-3">
          <h2 id="footer-services" className="text-[0.6875rem] tracking-[0.14em] text-white/40 uppercase">
            Services
          </h2>
          <ul className="mt-5 space-y-2.5">
            {serviceLinks.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  className="group inline-flex items-center gap-1 text-[0.9375rem] text-white/75 transition-colors hover:text-white"
                >
                  {link.label}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 -translate-y-px opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <h2 className="text-[0.6875rem] tracking-[0.14em] text-white/40 uppercase">
            About this sample
          </h2>
          <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-white/65">
            <li>Design reference only</li>
            <li>No live data</li>
            <li>To be adapted per country</li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-[0.6875rem] tracking-[0.14em] text-white/40 uppercase">Contact</h2>
          <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-white/65">
            <li className="text-white/45">
              Consumer Affairs Division
              <br />
              [Street address]
              <br />
              [Town, country]
            </li>
            <li className="text-white/45">[Telephone number]</li>
            <li className="text-white/45">[Email address]</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Funding attribution — EDF visibility requirement */}
    <div className="border-t border-white/12">
      <div className="shell flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-6">
        <EuFlag className="h-8 w-12 shrink-0 rounded-sm" />
        <p className="text-[0.75rem] leading-relaxed text-white/45">
          Produced under a programme funded by the European Union. Each national site will carry its
          own visibility statement and attribution, confirmed with the contracting authority before
          publication.
        </p>
      </div>
    </div>

    <div className="border-t border-white/12">
      <div className="shell flex flex-col gap-3 py-5 text-[0.75rem] text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>Design sample. Not for publication.</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          <li>Accessibility statement</li>
          <li>Privacy notice</li>
          <li>Terms of use</li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
