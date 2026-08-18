"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileText,
  LogOut,
  Plus,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Field from "@/components/field";
import DatePicker from "@/components/date-picker";
import Callout from "@/components/callout";
import { CaseStatusBadge, PriceStatusBadge } from "@/components/status-badge";
import Sparkline from "@/components/charts/sparkline";
import {
  ComplaintsByCategoryChart,
  ComplaintsOverTimeChart,
  ComplianceByCategoryChart,
  ResolutionTimeChart,
} from "@/components/charts/analytics-charts";
import { type Complaint, type PriceEntry } from "@/data/mockData";
import { toast } from "sonner";

const STATUSES: Complaint["status"][] = [
  "Submitted",
  "Under Review",
  "Investigation",
  "Resolved",
];
const CATEGORIES = ["Food", "Fuel", "Household", "Electronics"];

const money = (value: number) => `$${value.toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const EMPTY_PRICE = {
  product: "",
  unit: "",
  price: "",
  controlled: "",
  supplier: "",
  date: "",
  category: "Food",
};

export default function OfficerDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [caseSearch, setCaseSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  useEffect(() => {
    Promise.all([
      fetch("/api/officer/complaints").then((r) => r.json()),
      fetch("/api/prices").then((r) => r.json()),
    ])
      .then(([complaintsData, pricesData]) => {
        setComplaints(complaintsData);
        setPrices(pricesData);
      })
      .catch(() => toast.error("Could not load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const [openCase, setOpenCase] = useState<Complaint | null>(null);
  const [draftStatus, setDraftStatus] = useState<Complaint["status"]>("Submitted");
  const [draftNote, setDraftNote] = useState("");

  const [priceForm, setPriceForm] = useState(EMPTY_PRICE);

  /* ------------------------------------------------------------- derived */

  const counts = useMemo(
    () => ({
      open: complaints.filter((entry) => entry.status !== "Resolved").length,
      unassigned: complaints.filter((entry) => !entry.assignedOfficer).length,
      resolved: complaints.filter((entry) => entry.status === "Resolved").length,
      overLimit: prices.filter((entry) => entry.surveyedPrice > entry.controlledPrice).length,
    }),
    [complaints, prices],
  );

  const visibleCases = useMemo(() => {
    const term = caseSearch.trim().toLowerCase();
    return complaints.filter((entry) => {
      const matchesTerm =
        !term ||
        entry.caseRef.toLowerCase().includes(term) ||
        entry.consumerName.toLowerCase().includes(term) ||
        entry.businessName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "All statuses" || entry.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [complaints, caseSearch, statusFilter]);

  /* -------------------------------------------------------------- actions */

  const openCaseDialog = (entry: Complaint) => {
    setOpenCase(entry);
    setDraftStatus(entry.status);
    setDraftNote("");
  };

  const saveCase = async () => {
    if (!openCase) return;
    try {
      const res = await fetch(`/api/officer/complaints/${openCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: draftStatus, note: draftNote }),
      });
      if (!res.ok) throw new Error();
      const updated: Complaint = await res.json();
      setComplaints((previous) =>
        previous.map((entry) => (entry.id === updated.id ? updated : entry))
      );
      toast.success(`Case ${openCase.caseRef} updated`, {
        description: `Status set to ${draftStatus}.`,
      });
      setOpenCase(null);
    } catch {
      toast.error("Could not update case — please try again.");
    }
  };

  const addPrice = async (event: React.FormEvent) => {
    event.preventDefault();
    const surveyed = Number.parseFloat(priceForm.price);
    const controlled = priceForm.controlled
      ? Number.parseFloat(priceForm.controlled)
      : surveyed;

    if (Number.isNaN(surveyed)) {
      toast.error("Enter a valid surveyed price");
      return;
    }

    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: priceForm.product,
          unit: priceForm.unit || "each",
          supplier: priceForm.supplier,
          surveyedPrice: surveyed,
          controlledPrice: controlled,
          lastUpdated: priceForm.date || new Date().toISOString().slice(0, 10),
          category: priceForm.category,
        }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      setPrices((previous) => [
        {
          id,
          product: priceForm.product,
          unit: priceForm.unit || "each",
          supplier: priceForm.supplier,
          surveyedPrice: surveyed,
          controlledPrice: controlled,
          lastUpdated: priceForm.date || new Date().toISOString().slice(0, 10),
          category: priceForm.category,
          history: [],
        },
        ...previous,
      ]);
      setPriceForm(EMPTY_PRICE);
      toast.success("Price survey recorded", {
        description: `${priceForm.product} at ${money(surveyed)}.`,
      });
    } catch {
      toast.error("Could not save price — please try again.");
    }
  };

  /* ----------------------------------------------------------------- view */

  return (
    <>
      {/* Officer bar — a distinct, denser register from the public pages, so it
          is always obvious which side of the service you are looking at. */}
      <div data-on-ink className="bg-ink text-white">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="eyebrow text-white/60">Consumer Affairs Division</p>
            <h1 className="mt-1.5 font-serif text-[1.75rem] leading-none tracking-[-0.018em]">
              Officer dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[0.9375rem] font-semibold leading-tight">Officer K. Williams</p>
              <p className="text-[0.8125rem] text-white/65">Senior Consumer Affairs Officer</p>
            </div>
            <Button asChild variant="inverseOutline" size="sm">
              <Link href="/">
                <LogOut aria-hidden="true" />
                Sign out
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="shell py-6 sm:py-8">
        {/* Compact metric strip */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
          {[
            { icon: ClipboardList, label: "Open cases", value: counts.open, note: "Not yet resolved" },
            { icon: Clock, label: "Awaiting assignment", value: counts.unassigned, note: "Needs an officer" },
            { icon: CheckCircle2, label: "Resolved", value: counts.resolved, note: "This month" },
            { icon: TrendingUp, label: "Prices above limit", value: counts.overLimit, note: `of ${prices.length} surveyed` },
          ].map((item) => (
            <div key={item.label} className="border-t border-g-300 pt-4" data-hairline>
              <dt className="flex items-center gap-1.5 text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">
                <item.icon className="h-3.5 w-3.5 text-g-600" aria-hidden="true" />
                {item.label}
              </dt>
              <dd
                className="figure-sm mt-3 text-ink"
                data-numeric=""
              >
                {item.value}
              </dd>
              <p className="mt-1 text-[0.75rem] text-g-600">{item.note}</p>
            </div>
          ))}
        </dl>

        <Tabs defaultValue="cases" className="mt-8">
          <TabsList>
            <TabsTrigger value="cases">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Cases
            </TabsTrigger>
            <TabsTrigger value="prices">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Price surveillance
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
              Reports &amp; analytics
            </TabsTrigger>
          </TabsList>

          {/* ------------------------------------------------------- CASES */}
          <TabsContent value="cases">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <label htmlFor="case-search" className="sr-only">
                  Search cases
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-g-600"
                  aria-hidden="true"
                />
                <Input
                  id="case-search"
                  className="pl-9"
                  placeholder="Search by case reference, consumer, or business"
                  value={caseSearch}
                  onChange={(event) => setCaseSearch(event.target.value)}
                />
              </div>
              <div className="sm:w-52">
                <label htmlFor="status-filter" className="sr-only">
                  Filter by status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["All statuses", ...STATUSES].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="secondary" onClick={() => toast.success("Case export queued")}>
                <Download aria-hidden="true" />
                Export
              </Button>
            </div>

            <p className="mt-4 text-sm text-g-600" aria-live="polite">
              Showing{" "}
              <strong className="font-semibold text-ink" data-numeric="">
                {visibleCases.length}
              </strong>{" "}
              of {complaints.length} cases
            </p>

            <div className="mt-3 overflow-hidden rounded-md border border-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-g-100">
                    <TableHead scope="col">Case</TableHead>
                    <TableHead scope="col">Consumer</TableHead>
                    <TableHead scope="col">Business</TableHead>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col">Filed</TableHead>
                    <TableHead scope="col">Officer</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCases.length === 0 ? (
                    <TableRow className="hover:bg-white">
                      <TableCell colSpan={8} className="py-12 text-center text-g-600">
                        No cases match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleCases.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell
                          className="whitespace-nowrap font-semibold text-ink"
                          data-numeric=""
                        >
                          {entry.caseRef}
                        </TableCell>
                        <TableCell className="text-[0.9375rem]">{entry.consumerName}</TableCell>
                        <TableCell className="text-[0.9375rem] text-g-700">
                          {entry.businessName}
                        </TableCell>
                        <TableCell className="text-[0.9375rem] text-g-700">
                          {entry.category}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-[0.9375rem] text-g-600" data-numeric="">
                          {formatDate(entry.dateFiled)}
                        </TableCell>
                        <TableCell className="text-[0.9375rem] text-g-700">
                          {/* Italic grey, not a colour — a coloured value reads as a link here */}
                          {entry.assignedOfficer || (
                            <span className="text-g-600 italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <CaseStatusBadge status={entry.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openCaseDialog(entry)}>
                            Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ------------------------------------------------------ PRICES */}
          <TabsContent value="prices">
            <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
              {/* Entry form */}
              <form
                onSubmit={addPrice}
                className="rounded-md border border-border bg-white"
                aria-labelledby="price-entry-heading"
              >
                <div className="border-b border-border px-5 py-4">
                  <h2
                    id="price-entry-heading"
                    className="font-serif text-[1.25rem] tracking-[-0.014em] text-ink"
                  >
                    Record a price survey
                  </h2>
                  <p className="mt-1 text-[0.8125rem] text-g-600">
                    Field entries appear on the public price page immediately.
                  </p>
                </div>

                <div className="space-y-5 px-5 py-5">
                  <Field id="p-product" label="Product">
                    <Input
                      id="p-product"
                      required
                      value={priceForm.product}
                      onChange={(event) =>
                        setPriceForm({ ...priceForm, product: event.target.value })
                      }
                      placeholder="White Rice"
                    />
                  </Field>

                  <Field id="p-unit" label="Unit or pack size" hint="For example, 1 kg or 500 ml">
                    <Input
                      id="p-unit"
                      value={priceForm.unit}
                      onChange={(event) => setPriceForm({ ...priceForm, unit: event.target.value })}
                      placeholder="1 kg"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field id="p-price" label="Surveyed">
                      <Input
                        id="p-price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={priceForm.price}
                        onChange={(event) =>
                          setPriceForm({ ...priceForm, price: event.target.value })
                        }
                        placeholder="0.00"
                      />
                    </Field>
                    <Field id="p-controlled" label="Legal max" optional>
                      <Input
                        id="p-controlled"
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceForm.controlled}
                        onChange={(event) =>
                          setPriceForm({ ...priceForm, controlled: event.target.value })
                        }
                        placeholder="0.00"
                      />
                    </Field>
                  </div>

                  <Field id="p-supplier" label="Shop or supplier">
                    <Input
                      id="p-supplier"
                      required
                      value={priceForm.supplier}
                      onChange={(event) =>
                        setPriceForm({ ...priceForm, supplier: event.target.value })
                      }
                      placeholder="Island Mart"
                    />
                  </Field>

                  <Field id="p-date" label="Date surveyed">
                    <DatePicker
                      id="p-date"
                      value={priceForm.date}
                      onChange={(next) => setPriceForm({ ...priceForm, date: next })}
                      placeholder="Choose the survey date"
                      disableFuture
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field id="p-category" label="Category">
                      <Select
                        value={priceForm.category}
                        onValueChange={(value) => setPriceForm({ ...priceForm, category: value })}
                      >
                        <SelectTrigger id="p-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-4">
                  <Button type="submit" className="w-full">
                    <Plus aria-hidden="true" />
                    Record survey
                  </Button>
                </div>
              </form>

              {/* Recent entries */}
              <div className="overflow-hidden rounded-md border border-border bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                  <h2 className="font-serif text-[1.25rem] tracking-[-0.014em] text-ink">
                    Recent surveys
                  </h2>
                  <p className="text-[0.8125rem] text-g-600" data-numeric="">
                    {prices.length} records
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-g-100">
                      <TableHead scope="col">Product</TableHead>
                      <TableHead scope="col" className="text-right">
                        Surveyed
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        Legal max
                      </TableHead>
                      <TableHead scope="col">Trend</TableHead>
                      <TableHead scope="col">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.slice(0, 12).map((entry) => {
                      const overLimit = entry.surveyedPrice > entry.controlledPrice;
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <span className="block font-medium text-ink">{entry.product}</span>
                            <span className="text-[0.8125rem] text-g-600">
                              {entry.unit} · {entry.supplier}
                            </span>
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${overLimit ? "text-flag" : "text-ink"}`}
                            data-numeric=""
                          >
                            {money(entry.surveyedPrice)}
                          </TableCell>
                          <TableCell className="text-right text-g-700" data-numeric="">
                            {money(entry.controlledPrice)}
                          </TableCell>
                          <TableCell>
                            <Sparkline data={entry.history} width={64} height={22} />
                          </TableCell>
                          <TableCell>
                            <PriceStatusBadge overLimit={overLimit} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ----------------------------------------------------- REPORTS */}
          <TabsContent value="reports">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="display-2 text-ink">Reports and analytics</h2>
                <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-g-600">
                  Aggregate figures for the last six months, for quarterly reporting.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => toast.success("Report export queued", { description: "PDF · last 6 months" })}
              >
                <Download aria-hidden="true" />
                Export report
              </Button>
            </div>

            <Callout variant="info" className="mt-5">
              Figures are illustrative sample data for this prototype. Every chart below also has a
              table view for screen readers and for pasting into a report.
            </Callout>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              <ComplaintsOverTimeChart />
              <ComplaintsByCategoryChart />
              <ComplianceByCategoryChart />
              <ResolutionTimeChart />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Case detail */}
      <Dialog open={Boolean(openCase)} onOpenChange={(open) => !open && setOpenCase(null)}>
        <DialogContent className="sm:max-w-2xl">
          {openCase && (
            <>
              <DialogHeader>
                <DialogTitle>
                  <span data-numeric="">{openCase.caseRef}</span>
                  <span className="ml-2 text-[0.9375rem] font-normal text-g-600">
                    {openCase.category}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-g-50 px-4 py-3">
                <span className="text-sm text-g-600">Current status</span>
                <CaseStatusBadge status={openCase.status} />
              </div>

              <dl className="grid gap-x-5 gap-y-3.5 sm:grid-cols-2">
                {[
                  ["Consumer", openCase.consumerName],
                  ["Contact", `${openCase.email} · ${openCase.phone}`],
                  ["Business", openCase.businessName],
                  ["Business address", openCase.businessAddress],
                  ["Date filed", formatDate(openCase.dateFiled)],
                  ["Assigned officer", openCase.assignedOfficer || "Unassigned"],
                ].map(([term, value]) => (
                  <div key={term}>
                    <dt className="text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">
                      {term}
                    </dt>
                    <dd className="mt-0.5 text-[0.9375rem] break-words text-ink">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-border pt-4">
                <h3 className="text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">
                  Consumer&rsquo;s account
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">
                  {openCase.description}
                </p>
              </div>

              {openCase.notes.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">
                    Case notes
                  </h3>
                  <ol className="mt-2 space-y-2">
                    {openCase.notes.map((note, index) => (
                      <li
                        key={index}
                        className="rounded-sm border-l-2 border-l-brand-green bg-g-50 px-3 py-2 text-[0.9375rem] text-ink"
                      >
                        {note}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Update */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-[0.9375rem] font-semibold text-ink">Update this case</h3>

                <Field id="draft-status" label="Status">
                  <Select
                    value={draftStatus}
                    onValueChange={(value) => setDraftStatus(value as Complaint["status"])}
                  >
                    <SelectTrigger id="draft-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  id="draft-note"
                  label="Add a case note"
                  hint="Internal only — not shown to the consumer."
                  optional
                >
                  <Textarea
                    id="draft-note"
                    rows={3}
                    value={draftNote}
                    onChange={(event) => setDraftNote(event.target.value)}
                    placeholder="Contacted the business; awaiting price records."
                  />
                </Field>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={() => setOpenCase(null)}>
                    <X aria-hidden="true" />
                    Cancel
                  </Button>
                  <Button onClick={saveCase}>
                    <CheckCircle2 aria-hidden="true" />
                    Save changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
