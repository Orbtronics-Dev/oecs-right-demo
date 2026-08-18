"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageHeader from "@/components/page-header";
import Callout from "@/components/callout";
import { PriceStatusBadge } from "@/components/status-badge";
import Sparkline from "@/components/charts/sparkline";
import PriceDetail from "@/components/price-detail";
import { type PriceEntry } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = ["All categories", "Food", "Fuel", "Household", "Electronics"];

const money = (value: number) => `$${value.toFixed(2)}`;

/** Change over the available history, as a signed percentage. */
const trendOf = (entry: PriceEntry) => {
  if (entry.history.length < 2) return null;
  const first = entry.history[0].surveyed;
  const last = entry.history[entry.history.length - 1].surveyed;
  if (first === 0) return null;
  return ((last - first) / first) * 100;
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function PriceCheckPage() {
  const [allPrices, setAllPrices] = useState<PriceEntry[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [onlyOverLimit, setOnlyOverLimit] = useState(false);
  /* One row open at a time: opening another closes the previous one, so the
     page never turns into a wall of expanded charts. */
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then(setAllPrices)
      .catch(() => {/* silently degrade */});
  }, []);

  const filtered = useMemo(
    () =>
      allPrices.filter((entry) => {
        const term = search.trim().toLowerCase();
        const matchesTerm =
          !term ||
          entry.product.toLowerCase().includes(term) ||
          entry.supplier.toLowerCase().includes(term);
        const matchesCategory = category === CATEGORIES[0] || entry.category === category;
        const matchesLimit = !onlyOverLimit || entry.surveyedPrice > entry.controlledPrice;
        return matchesTerm && matchesCategory && matchesLimit;
      }),
    [allPrices, search, category, onlyOverLimit],
  );

  const overLimitCount = filtered.filter(
    (entry) => entry.surveyedPrice > entry.controlledPrice,
  ).length;

  const filtersActive =
    Boolean(search.trim()) || category !== CATEGORIES[0] || onlyOverLimit;

  const clearFilters = () => {
    setSearch("");
    setCategory(CATEGORIES[0]);
    setOnlyOverLimit(false);
  };

  const toggleRow = (id: string) => setOpenId((current) => (current === id ? null : id));

  /**
   * Whole-row click as a pointer convenience. The Details button stays the
   * accessible control — it is what carries aria-expanded and what keyboard and
   * screen-reader users operate; a click handler on a `tr` is neither focusable
   * nor announced, so it can only ever be an addition.
   *
   * Clicks that land on a real control inside the row are ignored, otherwise the
   * button's own handler and this one would both fire and cancel each other out.
   */
  const rowClick = (id: string) => (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, label, summary")) return;
    toggleRow(id);
  };

  const setAlert = (entry: PriceEntry) =>
    toast.success(`Price alert set for ${entry.product}`, {
      description: "We will email you if the surveyed price changes.",
    });

  return (
    <>
      <PageHeader
        title="Check prices"
        lead="Compare what a shop charged you against the legal maximum price. Updated weekly by Consumer Affairs officers."
        crumbs={[{ label: "Home", path: "/" }, { label: "Check prices" }]}
      />

      <div className="shell py-8 sm:py-10">
        <Callout variant="info" title="What am I looking at?" className="max-w-3xl">
          The <strong>legal maximum</strong> is the highest price a business may lawfully charge for
          a price-controlled item. The <strong>surveyed price</strong> is what our officers actually
          recorded in shops. If the surveyed price is higher than the legal maximum, that business
          may be breaking the law — and you can report it.
        </Callout>

        {/* Filters — one row, above the data, never hidden behind a menu */}
        <section aria-labelledby="filters-heading" className="mt-8">
          <h2 id="filters-heading" className="sr-only">
            Filter prices
          </h2>
          <div className="rounded-md border border-border bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label
                  htmlFor="price-search"
                  className="mb-1.5 block text-sm font-semibold text-ink"
                >
                  Search for a product or shop
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-g-600"
                    aria-hidden="true"
                  />
                  <Input
                    id="price-search"
                    className="pl-9"
                    placeholder="For example, rice or Island Mart"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="lg:w-auto">
                <div className="lg:w-48">
                  <label
                    htmlFor="price-category"
                    className="mb-1.5 block text-sm font-semibold text-ink"
                  >
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="price-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <label
                htmlFor="over-limit"
                className="flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink"
              >
                <Checkbox
                  id="over-limit"
                  checked={onlyOverLimit}
                  onCheckedChange={(checked) => setOnlyOverLimit(checked === true)}
                />
                Only show prices above the legal maximum
              </label>

              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X aria-hidden="true" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Result summary — announced, so filtering is audible as well as visible */}
        <p className="mt-6 flex items-center gap-2 text-[0.9375rem] text-g-700" aria-live="polite">
          <SlidersHorizontal className="h-4 w-4 text-g-600" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-ink" data-numeric="">
              {filtered.length}
            </strong>{" "}
            {filtered.length === 1 ? "product" : "products"}
            {overLimitCount > 0 && (
              <>
                {" · "}
                <strong className="font-semibold text-flag" data-numeric="">
                  {overLimitCount}
                </strong>{" "}
                above the legal maximum
              </>
            )}
          </span>
        </p>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-md border border-border bg-white px-6 py-14 text-center">
            <p className="text-[1.0625rem] font-semibold text-ink">No products match your search</p>
            <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-g-600">
              Try a shorter search term, or clear your filters to see everything we monitor.
            </p>
            <Button variant="secondary" className="mt-5" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: a real table. Numeric columns are tabular and right-aligned. */}
            <div className="mt-4 hidden overflow-hidden rounded-md border border-border bg-white lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-g-100">
                    <TableHead scope="col">Product</TableHead>
                    <TableHead scope="col" className="text-right">
                      Surveyed price
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Legal maximum
                    </TableHead>
                    <TableHead scope="col">6-month trend</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => {
                    const overLimit = entry.surveyedPrice > entry.controlledPrice;
                    const difference = entry.surveyedPrice - entry.controlledPrice;
                    const trend = trendOf(entry);

                    const expanded = openId === entry.id;

                    return (
                      <Fragment key={entry.id}>
                      <TableRow
                        onClick={rowClick(entry.id)}
                        className={cn(
                          "cursor-pointer",
                          expanded && "bg-g-50 hover:bg-g-50",
                        )}
                      >
                        <TableCell>
                          <span className="block font-semibold text-ink">{entry.product}</span>
                          <span className="mt-0.5 block text-[0.8125rem] text-g-600">
                            {entry.unit} · {entry.supplier}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`block font-semibold ${overLimit ? "text-flag" : "text-ink"}`}
                            data-numeric=""
                          >
                            {money(entry.surveyedPrice)}
                          </span>
                          {overLimit && (
                            <span
                              className="mt-0.5 block text-[0.8125rem] text-flag"
                              data-numeric=""
                            >
                              {money(difference)} over
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-g-700" data-numeric="">
                          {money(entry.controlledPrice)}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2.5">
                            <Sparkline data={entry.history} />
                            {trend !== null && (
                              <span
                                className={`text-[0.8125rem] font-semibold ${
                                  trend > 0.5
                                    ? "text-flag"
                                    : trend < -0.5
                                      ? "text-ok"
                                      : "text-g-600"
                                }`}
                                data-numeric=""
                              >
                                {trend > 0 ? "+" : ""}
                                {trend.toFixed(1)}%
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <PriceStatusBadge overLimit={overLimit} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(entry.id)}
                            aria-expanded={expanded}
                            aria-controls={`price-detail-${entry.id}`}
                          >
                            {expanded ? "Hide" : "Details"}
                            <ChevronDown
                              className={cn(
                                "transition-transform duration-300",
                                expanded && "rotate-180",
                              )}
                              aria-hidden="true"
                            />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow className="hover:bg-g-50">
                          <TableCell colSpan={6} className="bg-g-50 px-4 py-0">
                            <div
                              id={`price-detail-${entry.id}`}
                              role="region"
                              aria-label={`Details for ${entry.product}`}
                              className="animate-page-in"
                            >
                              <PriceDetail entry={entry} onSetAlert={setAlert} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: the same rows as cards. A horizontally scrolling table is
                not a usable answer on a phone. */}
            <ul className="mt-4 space-y-3 lg:hidden">
              {filtered.map((entry) => {
                const overLimit = entry.surveyedPrice > entry.controlledPrice;
                const difference = entry.surveyedPrice - entry.controlledPrice;
                const trend = trendOf(entry);
                const expanded = openId === entry.id;

                return (
                  <li
                    key={entry.id}
                    onClick={rowClick(entry.id)}
                    className={cn(
                      "cursor-pointer rounded-md border p-4",
                      expanded ? "border-g-400 bg-g-50" : "border-border bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[1.0625rem] font-semibold leading-snug text-ink">
                          {entry.product}
                        </h3>
                        <p className="mt-0.5 text-[0.8125rem] text-g-600">
                          {entry.unit} · {entry.supplier}
                        </p>
                      </div>
                      <PriceStatusBadge overLimit={overLimit} className="shrink-0" />
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-border">
                      <div className="bg-g-50 px-3 py-2.5">
                        <dt className="text-[0.75rem] font-semibold tracking-[0.03em] text-g-600 uppercase">
                          Surveyed
                        </dt>
                        <dd
                          className={`mt-0.5 text-lg font-bold ${overLimit ? "text-flag" : "text-ink"}`}
                          data-numeric=""
                        >
                          {money(entry.surveyedPrice)}
                        </dd>
                      </div>
                      <div className="bg-g-50 px-3 py-2.5">
                        <dt className="text-[0.75rem] font-semibold tracking-[0.03em] text-g-600 uppercase">
                          Legal maximum
                        </dt>
                        <dd className="mt-0.5 text-lg font-bold text-ink" data-numeric="">
                          {money(entry.controlledPrice)}
                        </dd>
                      </div>
                    </dl>

                    {overLimit && (
                      <p className="mt-3 text-[0.9375rem] font-semibold text-flag">
                        {money(difference)} above the legal maximum
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                      <span className="flex items-center gap-2">
                        <Sparkline data={entry.history} width={64} height={22} />
                        {trend !== null && (
                          <span className="text-[0.8125rem] font-semibold text-g-700" data-numeric="">
                            {trend > 0 ? "+" : ""}
                            {trend.toFixed(1)}% in 6 months
                          </span>
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(entry.id)}
                        aria-expanded={expanded}
                        aria-controls={`price-detail-m-${entry.id}`}
                      >
                        {expanded ? "Hide" : "Details"}
                        <ChevronDown
                          className={cn("transition-transform duration-300", expanded && "rotate-180")}
                          aria-hidden="true"
                        />
                      </Button>
                    </div>

                    {expanded && (
                      <div
                        id={`price-detail-m-${entry.id}`}
                        role="region"
                        aria-label={`Details for ${entry.product}`}
                        className="animate-page-in mt-3 border-t border-border"
                      >
                        <PriceDetail entry={entry} onSetAlert={setAlert} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Explainer */}
        <section className="mt-14 max-w-3xl">
          <h2 className="display-3 border-t-2 border-ink pt-4 text-ink">
            How price controls work
          </h2>
          <Accordion type="multiple" className="mt-4 border-t border-border">
            {[
              {
                q: "Which products have a legal maximum price?",
                a: "Government sets maximum retail prices for essential goods — basic foods, fuel, and some household necessities. The list is published in the official gazette and updated when import costs change. Not every product in a shop is price-controlled.",
              },
              {
                q: "What should I do if I was charged more than the legal maximum?",
                a: "Keep your receipt and file a complaint through this portal. Include a photo of the receipt and of the shelf label if you can. Charging above a controlled price is an offence, and businesses can be fined.",
              },
              {
                q: "How often are these prices checked?",
                a: "Consumer Affairs officers survey shops weekly. The date each price was last checked is shown alongside it. Prices can change between surveys, so treat the surveyed figure as a guide rather than a guarantee.",
              },
              {
                q: "Why is one shop cheaper than another for the same item?",
                a: "The legal maximum is a ceiling, not a fixed price. Shops are free to charge less, and many do. Comparing surveyed prices across shops is a good way to find a better deal.",
              },
            ].map((item, index) => (
              <AccordionItem key={item.q} value={`price-faq-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="prose-editorial">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </>
  );
}
