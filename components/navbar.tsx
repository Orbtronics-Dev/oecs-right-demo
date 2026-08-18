"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Lock, Menu, X } from "lucide-react";
import ServiceMark from "@/components/service-mark";
import AccessibilityControls from "@/components/accessibility-controls";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "File a complaint", path: "/complaint" },
  { label: "Check prices", path: "/prices" },
  { label: "Track a case", path: "/track" },
  { label: "Know your rights", path: "/rights" },
  { label: "Updates", path: "/updates" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  // The header sits on the canvas until you scroll, then gains a hairline and
  // a blur. No shadow — the rule is enough, and it keeps the page feeling flat.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Sample notice. Deliberately explicit: each country will run its
          own site with its own branding, and this must not be mistaken for a
          single shared portal. */}
      <div className="bg-ink text-white">
        <div className="shell flex items-center justify-center py-2 text-center">
          <p className="text-[0.75rem] leading-snug text-white/75">
            <span className="font-semibold text-white">Design sample.</span> Not a live service.
            Each country will have its own site, branding and content. All data shown is
            illustrative.
          </p>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-colors duration-300",
          scrolled
            ? "border-b border-g-200 bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70"
            : "border-b border-transparent bg-canvas",
        )}
      >
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label="Consumer Protection — home">
            <ServiceMark />
          </Link>

          {/* Desktop nav — sans, small, quiet. The active item is marked by a
              dot rather than a filled tab. */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const active = pathname.startsWith(link.path);
                return (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative whitespace-nowrap text-[0.9375rem] transition-colors",
                        active ? "font-medium text-ink" : "text-g-600 hover:text-ink",
                      )}
                    >
                      {link.label}
                      <span
                        className={cn(
                          "absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-300",
                          active ? "bg-brand-green opacity-100" : "bg-ink opacity-0",
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <AccessibilityControls />
            <Link
              href="/officer-login"
              className="hidden items-center gap-1.5 rounded-pill border border-g-300 px-3.5 py-2 text-[0.8125rem] font-medium text-g-700 transition-colors hover:border-ink hover:text-ink lg:inline-flex"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Officers
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-sheet"
              className="flex h-10 w-10 items-center justify-center rounded-pill border border-g-300 text-ink transition-colors hover:border-ink lg:hidden"
            >
              {open ? (
                <X className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
              ) : (
                <Menu className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
              )}
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet — full-bleed, serif links at display size. Staggered in,
          which is the one place the menu itself is allowed to perform. */}
      {open && (
        <div
          id="mobile-sheet"
          className="fixed inset-x-0 top-[6.1rem] bottom-0 z-40 overflow-y-auto bg-canvas lg:hidden"
        >
          <nav aria-label="Main" className="shell py-8">
            <ul>
              {navLinks.map((link, index) => {
                const active = pathname.startsWith(link.path);
                return (
                  <li key={link.path} className="border-b border-g-200">
                    <Link
                      href={link.path}
                      aria-current={active ? "page" : undefined}
                      className="flex items-baseline justify-between gap-4 py-5 animate-page-in"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <span
                        className={cn(
                          "display-3",
                          active ? "text-ink" : "text-g-700",
                        )}
                      >
                        {link.label}
                      </span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-g-400" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/officer-login"
              className="mt-8 inline-flex items-center gap-2 rounded-pill border border-g-300 px-4 py-2.5 text-[0.9375rem] font-medium text-g-700"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Officer portal
            </Link>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
