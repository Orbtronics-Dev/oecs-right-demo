"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp, FileBadge, Plus, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Field from "@/components/field";

interface PriceCalculation {
  id: string;
  importerName: string;
  productName: string;
  category: string;
  cifUsd: number;
  ecRate: number;
  duties: number;
  portCharges: number;
  variableCosts: number;
  wholesaleMarkupPct: number;
  retailMarkupPct: number;
  calculatedMrp: number;
  stage: "submitted" | "officer_verified" | "senior_certified" | "director_approved";
  submittedAt: string;
  verifiedAt: string | null;
  certifiedAt: string | null;
  approvedAt: string | null;
  officerNote: string;
}

interface MarkupParam {
  id: string;
  category: string;
  wholesalePct: number;
  retailPct: number;
  updatedAt: string;
}

interface CsvRow {
  importerName: string;
  productName: string;
  category: string;
  cifUsd: number;
  ecRate: number;
  duties: number;
  portCharges: number;
  variableCosts: number;
  wholesaleMarkupPct: number;
  retailMarkupPct: number;
  calculatedMrp: number;
  error?: string;
}

const CSV_HEADERS = [
  "importer_name",
  "product",
  "category",
  "cif_usd",
  "ec_rate",
  "duties",
  "port_charges",
  "variable_costs",
  "wholesale_markup_pct",
  "retail_markup_pct",
];

const CSV_TEMPLATE =
  "importer_name,product,category,cif_usd,ec_rate,duties,port_charges,variable_costs,wholesale_markup_pct,retail_markup_pct\n" +
  "Caribbean Imports Ltd,White Rice (25 kg bag),Food,500.00,2.719,45.00,20.00,15.00,20,22.5\n";

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(",").map((col) => col.trim().replace(/^"|"$/g, ""));
    if (cols.length < CSV_HEADERS.length) {
      rows.push({ importerName: "", productName: "", category: "", cifUsd: 0, ecRate: 0, duties: 0, portCharges: 0, variableCosts: 0, wholesaleMarkupPct: 0, retailMarkupPct: 0, calculatedMrp: 0, error: `Row ${i}: not enough columns` });
      continue;
    }
    const cifUsd = parseFloat(cols[3]);
    const ecRate = parseFloat(cols[4]) || 2.719;
    const duties = parseFloat(cols[5]) || 0;
    const portCharges = parseFloat(cols[6]) || 0;
    const variableCosts = parseFloat(cols[7]) || 0;
    const wholesaleMarkupPct = parseFloat(cols[8]) || 0;
    const retailMarkupPct = parseFloat(cols[9]) || 0;
    if (!cols[0] || !cols[1] || isNaN(cifUsd)) {
      rows.push({ importerName: cols[0] || "", productName: cols[1] || "", category: cols[2] || "Food", cifUsd, ecRate, duties, portCharges, variableCosts, wholesaleMarkupPct, retailMarkupPct, calculatedMrp: 0, error: `Row ${i}: importer name, product, and CIF value are required` });
      continue;
    }
    const calculatedMrp = computeClientMrp(cifUsd, ecRate, duties, portCharges, variableCosts, wholesaleMarkupPct, retailMarkupPct);
    rows.push({ importerName: cols[0], productName: cols[1], category: cols[2] || "Food", cifUsd, ecRate, duties, portCharges, variableCosts, wholesaleMarkupPct, retailMarkupPct, calculatedMrp });
  }
  return rows;
}

const CATEGORIES = ["Food", "Fuel", "Household", "Electronics"];

const EC_RATE_DEFAULT = 2.719;

const STAGE_LABELS: Record<PriceCalculation["stage"], string> = {
  submitted: "Submitted",
  officer_verified: "Officer Verified",
  senior_certified: "Senior Certified",
  director_approved: "Director Approved",
};

const STAGE_NEXT: Partial<Record<PriceCalculation["stage"], PriceCalculation["stage"]>> = {
  submitted: "officer_verified",
  officer_verified: "senior_certified",
  senior_certified: "director_approved",
};

/** Which roles may advance a calculation from a given stage. */
const STAGE_ADVANCE_ROLES: Record<PriceCalculation["stage"], string[]> = {
  submitted: ["consumer_affairs_officer", "senior_officer", "director"],
  officer_verified: ["senior_officer", "director"],
  senior_certified: ["director"],
  director_approved: [],
};

function canAdvance(stage: PriceCalculation["stage"], role?: string): boolean {
  if (!role) return false;
  return STAGE_ADVANCE_ROLES[stage].includes(role);
}

const STAGE_BADGE_CLASS: Record<PriceCalculation["stage"], string> = {
  submitted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  officer_verified: "bg-blue-100 text-blue-800 border-blue-200",
  senior_certified: "bg-purple-100 text-purple-800 border-purple-200",
  director_approved: "bg-green-100 text-green-800 border-green-200",
};

const money = (value: number) => `EC $${value.toFixed(2)}`;

function computeClientMrp(
  cifUsd: number,
  ecRate: number,
  duties: number,
  portCharges: number,
  variableCosts: number,
  wholesaleMarkupPct: number,
  retailMarkupPct: number
): number {
  const landedCost = cifUsd * ecRate + duties + portCharges + variableCosts;
  const mrp = landedCost * (1 + wholesaleMarkupPct / 100) * (1 + retailMarkupPct / 100);
  return Math.round(mrp * 100) / 100;
}

const EMPTY_FORM = {
  importerName: "",
  productName: "",
  category: "Food",
  cifUsd: "",
  ecRate: String(EC_RATE_DEFAULT),
  duties: "",
  portCharges: "",
  variableCosts: "",
  wholesaleMarkupPct: "",
  retailMarkupPct: "",
};

export default function PriceControlTab({ role }: { role?: string }) {
  const [calculations, setCalculations] = useState<PriceCalculation[]>([]);
  const [markupParams, setMarkupParams] = useState<MarkupParam[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [markupOpen, setMarkupOpen] = useState(false);
  const [markupEdits, setMarkupEdits] = useState<Record<string, { wholesalePct: string; retailPct: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"manual" | "csv">("manual");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [csvSubmitting, setCsvSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCalculations = useCallback(async () => {
    const response = await fetch("/api/officer/price-calculations");
    if (response.ok) {
      const data = await response.json() as PriceCalculation[];
      setCalculations(data);
    }
  }, []);

  const loadMarkupParams = useCallback(async () => {
    const response = await fetch("/api/officer/markup-params");
    if (response.ok) {
      const data = await response.json() as MarkupParam[];
      setMarkupParams(data);
      const edits: Record<string, { wholesalePct: string; retailPct: string }> = {};
      for (const markupParam of data) {
        edits[markupParam.id] = {
          wholesalePct: String(markupParam.wholesalePct),
          retailPct: String(markupParam.retailPct),
        };
      }
      setMarkupEdits(edits);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadCalculations(), loadMarkupParams()]).catch(() =>
      toast.error("Could not load price control data")
    );
  }, [loadCalculations, loadMarkupParams]);

  // Pre-fill markup when category changes
  useEffect(() => {
    const matchingParam = markupParams.find(
      (markupParam) => markupParam.category.toLowerCase() === form.category.toLowerCase()
    );
    if (matchingParam) {
      setForm((previous) => ({
        ...previous,
        wholesaleMarkupPct: String(matchingParam.wholesalePct),
        retailMarkupPct: String(matchingParam.retailPct),
      }));
    }
  }, [form.category, markupParams]);

  const setField = (key: keyof typeof EMPTY_FORM, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const previewMrp = () => {
    const cifUsd = parseFloat(form.cifUsd);
    const ecRate = parseFloat(form.ecRate);
    const duties = parseFloat(form.duties) || 0;
    const portCharges = parseFloat(form.portCharges) || 0;
    const variableCosts = parseFloat(form.variableCosts) || 0;
    const wholesaleMarkupPct = parseFloat(form.wholesaleMarkupPct) || 0;
    const retailMarkupPct = parseFloat(form.retailMarkupPct) || 0;
    if (isNaN(cifUsd) || isNaN(ecRate)) return null;
    return computeClientMrp(cifUsd, ecRate, duties, portCharges, variableCosts, wholesaleMarkupPct, retailMarkupPct);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cifUsd = parseFloat(form.cifUsd);
    const ecRate = parseFloat(form.ecRate);
    if (isNaN(cifUsd) || isNaN(ecRate)) {
      toast.error("Enter a valid CIF value and EC rate");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/officer/price-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importerName: form.importerName,
          productName: form.productName,
          category: form.category,
          cifUsd,
          ecRate,
          duties: parseFloat(form.duties) || 0,
          portCharges: parseFloat(form.portCharges) || 0,
          variableCosts: parseFloat(form.variableCosts) || 0,
          wholesaleMarkupPct: parseFloat(form.wholesaleMarkupPct) || 0,
          retailMarkupPct: parseFloat(form.retailMarkupPct) || 0,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const newCalculation = await response.json() as PriceCalculation;
      setCalculations((previous) => [newCalculation, ...previous]);
      setForm(EMPTY_FORM);
      toast.success("MRP calculation submitted", {
        description: `${form.productName}: MRP ${money(newCalculation.calculatedMrp)}`,
      });
    } catch {
      toast.error("Could not submit calculation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceStage = async (calculation: PriceCalculation) => {
    if (calculation.stage === "director_approved") {
      toast.success("Signed PDF ready. The importer will be notified.", {
        description: `${calculation.productName} · MRP ${money(calculation.calculatedMrp)}`,
      });
      return;
    }
    const nextStage = STAGE_NEXT[calculation.stage];
    if (!nextStage) return;
    try {
      const response = await fetch(`/api/officer/price-calculations/${calculation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage, note: "" }),
      });
      if (!response.ok) throw new Error("Failed");
      const updated = await response.json() as PriceCalculation;
      setCalculations((previous) =>
        previous.map((existingCalculation) =>
          existingCalculation.id === updated.id ? updated : existingCalculation
        )
      );
      toast.success(`Stage advanced to "${STAGE_LABELS[nextStage]}"`, {
        description: calculation.productName,
      });
    } catch {
      toast.error("Could not advance stage. Please try again.");
    }
  };

  const handleSaveMarkup = async (markupParam: MarkupParam) => {
    const edit = markupEdits[markupParam.id];
    if (!edit) return;
    const wholesalePct = parseFloat(edit.wholesalePct);
    const retailPct = parseFloat(edit.retailPct);
    if (isNaN(wholesalePct) || isNaN(retailPct)) {
      toast.error("Enter valid percentage values");
      return;
    }
    try {
      const response = await fetch(`/api/officer/markup-params/${markupParam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wholesalePct, retailPct }),
      });
      if (!response.ok) throw new Error("Failed");
      const updated = await response.json() as MarkupParam;
      setMarkupParams((previous) =>
        previous.map((existingParam) =>
          existingParam.id === updated.id ? updated : existingParam
        )
      );
      toast.success(`Markup for ${markupParam.category} updated`);
    } catch {
      toast.error("Could not save markup. Please try again.");
    }
  };

  const handleCsvFile = (file: File) => {
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvRows(parseCsv(text));
    };
    reader.readAsText(file);
  };

  const handleCsvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleCsvFile(file);
  };

  const handleCsvDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) handleCsvFile(file);
  };

  const handleCsvSubmit = async () => {
    const validRows = csvRows.filter((row) => !row.error);
    if (validRows.length === 0) return;
    setCsvSubmitting(true);
    let succeeded = 0;
    let failed = 0;
    for (const row of validRows) {
      try {
        const response = await fetch("/api/officer/price-calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            importerName: row.importerName,
            productName: row.productName,
            category: row.category,
            cifUsd: row.cifUsd,
            ecRate: row.ecRate,
            duties: row.duties,
            portCharges: row.portCharges,
            variableCosts: row.variableCosts,
            wholesaleMarkupPct: row.wholesaleMarkupPct,
            retailMarkupPct: row.retailMarkupPct,
          }),
        });
        if (!response.ok) throw new Error();
        const newCalc = await response.json() as PriceCalculation;
        setCalculations((prev) => [newCalc, ...prev]);
        succeeded++;
      } catch {
        failed++;
      }
    }
    setCsvSubmitting(false);
    if (succeeded > 0) {
      toast.success(`${succeeded} calculation${succeeded !== 1 ? "s" : ""} submitted`);
    }
    if (failed > 0) {
      toast.error(`${failed} row${failed !== 1 ? "s" : ""} failed to submit`);
    }
    setCsvRows([]);
    setCsvFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMode("manual");
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mrp-calculations-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewedMrp = previewMrp();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        {/* Left panel: new MRP calculation form */}
        <div className="rounded-md border border-border bg-white">
          <div className="border-b border-border px-5 py-4">
            <h2
              id="mrp-form-heading"
              className="font-serif text-[1.25rem] tracking-[-0.014em] text-ink"
            >
              New MRP calculation
            </h2>
            <p className="mt-1 text-[0.8125rem] text-g-600">
              Enter import cost data to calculate the maximum retail price.
            </p>
            <div className="mt-3 flex rounded-md border border-border p-0.5 text-[0.8125rem]">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 rounded py-1 font-medium transition-colors ${mode === "manual" ? "bg-ink text-white" : "text-g-600 hover:text-ink"}`}
              >
                Manual entry
              </button>
              <button
                type="button"
                onClick={() => setMode("csv")}
                className={`flex-1 rounded py-1 font-medium transition-colors ${mode === "csv" ? "bg-ink text-white" : "text-g-600 hover:text-ink"}`}
              >
                CSV upload
              </button>
            </div>
          </div>
        {mode === "manual" ? (
        <form
          onSubmit={handleSubmit}
          aria-labelledby="mrp-form-heading"
        >

          <div className="space-y-4 px-5 py-5">
            <Field id="calc-importer" label="Importer name">
              <Input
                id="calc-importer"
                required
                value={form.importerName}
                onChange={(event) => setField("importerName", event.target.value)}
                placeholder="Caribbean Imports Ltd"
              />
            </Field>

            <Field id="calc-product" label="Product">
              <Input
                id="calc-product"
                required
                value={form.productName}
                onChange={(event) => setField("productName", event.target.value)}
                placeholder="White Rice (25 kg bag)"
              />
            </Field>

            <Field id="calc-category" label="Category">
              <Select
                value={form.category}
                onValueChange={(value) => setField("category", value)}
              >
                <SelectTrigger id="calc-category">
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

            <div className="grid grid-cols-2 gap-4">
              <Field
                id="calc-cif"
                label="CIF (USD)"
                tooltip="Cost, Insurance and Freight: the total landed value of the imported goods in US dollars, as declared to Customs. Includes the purchase price, shipping, and insurance to the port of entry."
              >
                <Input
                  id="calc-cif"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.cifUsd}
                  onChange={(event) => setField("cifUsd", event.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <Field
                id="calc-rate"
                label="EC rate"
                tooltip="Eastern Caribbean Dollar exchange rate against the US Dollar. The EC dollar is pegged at 2.7169 USD = 1 XCD (2.719 is the conventional rounding used in price control calculations)."
              >
                <Input
                  id="calc-rate"
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  value={form.ecRate}
                  onChange={(event) => setField("ecRate", event.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field
                id="calc-duties"
                label="Duties (EC)"
                tooltip="Customs duties and import taxes levied by the government on the imported goods, in Eastern Caribbean dollars. Drawn from the ASYCUDA import declaration."
              >
                <Input
                  id="calc-duties"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.duties}
                  onChange={(event) => setField("duties", event.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <Field
                id="calc-port"
                label="Port charges"
                tooltip="Handling, stevedoring, and storage fees charged at the port of entry after the goods arrive. Includes wharfage and any port authority levies."
              >
                <Input
                  id="calc-port"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.portCharges}
                  onChange={(event) => setField("portCharges", event.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <Field
                id="calc-variable"
                label="Variable costs"
                tooltip="Other allowable costs incurred in bringing the goods to market: inland transport, insurance after the port, and any other costs recognised under the applicable price control regulations."
              >
                <Input
                  id="calc-variable"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.variableCosts}
                  onChange={(event) => setField("variableCosts", event.target.value)}
                  placeholder="0.00"
                />
              </Field>
            </div>

            <Field
              id="calc-wholesale"
              label="Wholesale markup %"
              tooltip="The government-set percentage added to the landed cost to cover the wholesaler's margin. Set by policy and stored in markup parameters. Applied before the retail markup."
            >
              <Input
                id="calc-wholesale"
                type="number"
                step="0.1"
                min="0"
                value={form.wholesaleMarkupPct}
                onChange={(event) => setField("wholesaleMarkupPct", event.target.value)}
                placeholder="20"
              />
            </Field>
            <Field
              id="calc-retail"
              label="Retail markup %"
              tooltip="The government-set percentage added after the wholesale markup to cover the retailer's margin. Applied on top of the wholesale-adjusted price to arrive at the Maximum Retail Price."
            >
              <Input
                id="calc-retail"
                type="number"
                step="0.1"
                min="0"
                value={form.retailMarkupPct}
                onChange={(event) => setField("retailMarkupPct", event.target.value)}
                placeholder="22.5"
              />
            </Field>

            {previewedMrp !== null && (
              <div className="rounded-md border border-border bg-g-50 px-4 py-3">
                <p className="text-[0.75rem] text-g-600 uppercase tracking-[0.12em]">
                  Calculated MRP (Maximum Retail Price)
                </p>
                <p className="mt-1 font-serif text-[1.5rem] tracking-[-0.02em] text-ink" data-numeric="">
                  {money(previewedMrp)}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-border px-5 py-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              <Plus aria-hidden="true" />
              {submitting ? "Submitting…" : "Submit for approval"}
            </Button>
          </div>
        </form>
        ) : (
        <div>
          <div className="space-y-4 px-5 py-5">
            {csvRows.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border py-10 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCsvDrop}
              >
                <Upload className="mb-3 h-8 w-8 text-g-400" aria-hidden="true" />
                <p className="text-[0.875rem] font-medium text-ink">
                  Drop a CSV file here
                </p>
                <p className="mt-1 text-[0.8125rem] text-g-500">
                  or{" "}
                  <button
                    type="button"
                    className="text-ink underline underline-offset-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse to upload
                  </button>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleCsvChange}
                  aria-label="Upload CSV file"
                />
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="mt-4 flex items-center gap-1.5 text-[0.8125rem] text-g-500 hover:text-ink"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Download template
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[0.8125rem] font-medium text-ink">{csvFileName}</p>
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={() => {
                      setCsvRows([]);
                      setCsvFileName("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-4 w-4 text-g-400 hover:text-ink" />
                  </button>
                </div>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-[0.8125rem]">
                    <thead>
                      <tr className="border-b border-border bg-g-50 text-left text-g-600">
                        <th className="px-3 py-2 font-medium">Product</th>
                        <th className="px-3 py-2 text-right font-medium">MRP (EC)</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {csvRows.map((row, i) => (
                        <tr key={i} className={row.error ? "bg-red-50" : ""}>
                          <td className="px-3 py-2">
                            <span className="block font-medium text-ink">{row.productName || "—"}</span>
                            <span className="text-g-500">{row.importerName || "—"}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-ink" data-numeric="">
                            {row.error ? "—" : money(row.calculatedMrp)}
                          </td>
                          <td className="px-3 py-2">
                            {row.error ? (
                              <span className="text-red-600">{row.error}</span>
                            ) : (
                              <span className="text-green-700">Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[0.8125rem] text-g-500">
                  {csvRows.filter((r) => !r.error).length} of {csvRows.length} rows ready to submit
                </p>
              </div>
            )}
          </div>
          <div className="border-t border-border px-5 py-4">
            <Button
              type="button"
              className="w-full"
              disabled={csvSubmitting || csvRows.filter((r) => !r.error).length === 0}
              onClick={handleCsvSubmit}
            >
              <Upload aria-hidden="true" />
              {csvSubmitting ? "Submitting…" : `Submit ${csvRows.filter((r) => !r.error).length || ""} calculation${csvRows.filter((r) => !r.error).length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
        )}
        </div>

        {/* Right panel: calculations table */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 className="font-serif text-[1.25rem] tracking-[-0.014em] text-ink">
                Calculations
              </h2>
              <p className="text-[0.8125rem] text-g-600" data-numeric="">
                {calculations.length} records
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-g-100">
                  <TableHead scope="col">Product</TableHead>
                  <TableHead scope="col" className="text-right">MRP (EC)</TableHead>
                  <TableHead scope="col">Stage</TableHead>
                  <TableHead scope="col">Submitted</TableHead>
                  <TableHead scope="col" className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calculation) => (
                  <TableRow key={calculation.id}>
                    <TableCell>
                      <span className="block font-medium text-ink">
                        {calculation.productName}
                      </span>
                      <span className="text-[0.8125rem] text-g-600">
                        {calculation.importerName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-ink" data-numeric="">
                      {money(calculation.calculatedMrp)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STAGE_BADGE_CLASS[calculation.stage]}
                      >
                        {STAGE_LABELS[calculation.stage]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[0.8125rem] text-g-600">
                      {new Date(calculation.submittedAt).toLocaleDateString("en-LC", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {calculation.stage === "director_approved" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAdvanceStage(calculation)}
                        >
                          <FileBadge className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                          Generate PDF
                        </Button>
                      ) : canAdvance(calculation.stage, role) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdvanceStage(calculation)}
                        >
                          Advance
                        </Button>
                      ) : (
                        <span className="text-[0.8125rem] text-g-400">Awaiting action</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {calculations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-g-500">
                      No calculations yet. Submit one using the form.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Markup parameters collapsible */}
          <Collapsible open={markupOpen} onOpenChange={setMarkupOpen}>
            <div className="rounded-md border border-border bg-white">
              <CollapsibleTrigger asChild>
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  aria-expanded={markupOpen}
                >
                  <div>
                    <h3 className="font-semibold text-ink">Markup parameters</h3>
                    <p className="text-[0.8125rem] text-g-600">
                      Wholesale and retail percentages by category
                    </p>
                  </div>
                  {markupOpen ? (
                    <ChevronUp className="h-4 w-4 text-g-500" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-g-500" aria-hidden="true" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Separator />
                <div className="divide-y divide-border">
                  {markupParams.map((markupParam) => {
                    const edit = markupEdits[markupParam.id] ?? {
                      wholesalePct: String(markupParam.wholesalePct),
                      retailPct: String(markupParam.retailPct),
                    };
                    return (
                      <div
                        key={markupParam.id}
                        className="flex flex-wrap items-end gap-4 px-5 py-4"
                      >
                        <div className="min-w-[7rem] flex-1">
                          <p className="font-medium text-ink">{markupParam.category}</p>
                          <p className="mt-0.5 text-[0.75rem] text-g-500">
                            Updated{" "}
                            {new Date(markupParam.updatedAt).toLocaleDateString("en-LC", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <div className="flex items-end gap-3">
                          <div>
                            <Label
                              htmlFor={`markup-wholesale-${markupParam.id}`}
                              className="mb-1.5 block text-[0.75rem] text-g-600"
                            >
                              Wholesale %
                            </Label>
                            <Input
                              id={`markup-wholesale-${markupParam.id}`}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-24"
                              value={edit.wholesalePct}
                              onChange={(event) =>
                                setMarkupEdits((previous) => ({
                                  ...previous,
                                  [markupParam.id]: {
                                    ...previous[markupParam.id],
                                    wholesalePct: event.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`markup-retail-${markupParam.id}`}
                              className="mb-1.5 block text-[0.75rem] text-g-600"
                            >
                              Retail %
                            </Label>
                            <Input
                              id={`markup-retail-${markupParam.id}`}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-24"
                              value={edit.retailPct}
                              onChange={(event) =>
                                setMarkupEdits((previous) => ({
                                  ...previous,
                                  [markupParam.id]: {
                                    ...previous[markupParam.id],
                                    retailPct: event.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={role !== "director"}
                            onClick={() => handleSaveMarkup(markupParam)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
