"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, FileBadge, Plus } from "lucide-react";
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

export default function PriceControlTab() {
  const [calculations, setCalculations] = useState<PriceCalculation[]>([]);
  const [markupParams, setMarkupParams] = useState<MarkupParam[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [markupOpen, setMarkupOpen] = useState(false);
  const [markupEdits, setMarkupEdits] = useState<Record<string, { wholesalePct: string; retailPct: string }>>({});
  const [submitting, setSubmitting] = useState(false);

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

  const previewedMrp = previewMrp();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        {/* Left panel: new MRP calculation form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-border bg-white"
          aria-labelledby="mrp-form-heading"
        >
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
          </div>

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
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdvanceStage(calculation)}
                        >
                          Advance
                        </Button>
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
