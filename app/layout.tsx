import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { a11yInitScript } from "@/lib/a11y";
import { initDb } from "@/lib/init-db";

// Initialise database tables and seed demo data on first server start.
initDb();

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Display roles — headlines, section titles, pull quotes, and figures.
 *
 * Newsreader is a variable optical-size serif, so it holds up far better than a
 * pure display face when a heading lands small or when a reader scales text up.
 * It still stays out of body copy and UI labels, where Inter is more legible.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: {
    default: "Consumer Protection Portal — design sample",
    template: "%s · Consumer Protection",
  },
  description:
    "Design sample for a national consumer protection service: file a complaint, check whether a price is legal, track a case, and understand your consumer rights.",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* suppressHydrationWarning: the pre-paint script below deliberately mutates
       <html> (adding `js`, and `hc` / data-text-size from saved preferences)
       before React hydrates, so the server and client class lists differ by
       design. data-scroll-behavior tells Next not to smooth-scroll route
       changes even though the stylesheet sets scroll-behavior: smooth. */
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: a11yInitScript }} />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
