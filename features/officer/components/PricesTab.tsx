"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Field from "@/components/field";
import DatePicker from "@/components/date-picker";
import { PriceStatusBadge } from "@/components/status-badge";
import Sparkline from "@/components/charts/sparkline";
import { toast } from "sonner";
import type { PriceEntry } from "@/features/prices/types";
import { addPriceEntry } from "@/features/prices/services/prices";

const CATEGORIES = ["Food", "Fuel", "Household", "Electronics"];

const money = (value: number) => `$${value.toFixed(2)}`;

const EMPTY_PRICE = {
  product: "",
  unit: "",
  price: "",
  controlled: "",
  supplier: "",
  date: "",
  category: "Food",
  outletId: "",
};

interface OutletRow {
  id: string;
  name: string;
  type: "supermarket" | "shop" | "pharmacy";
  zone: string;
  lastSurveyedAt: string | null;
}

interface PricesTabProps {
  prices: PriceEntry[];
  onPricesChange: (updated: PriceEntry[]) => void;
}

const BREACH_BADGE_CLASS: Record<NonNullable<PriceEntry["breachStatus"]>, string> = {
  open: "bg-red-100 text-red-800 border-red-200",
  under_investigation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
};

const BREACH_LABELS: Record<NonNullable<PriceEntry["breachStatus"]>, string> = {
  open: "Breach open",
  under_investigation: "Under investigation",
  resolved: "Resolved",
};

export default function PricesTab({ prices, onPricesChange }: PricesTabProps) {
  const [form, setForm] = useState(EMPTY_PRICE);
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [breachDialogEntry, setBreachDialogEntry] = useState<PriceEntry | null>(null);

  const loadOutlets = useCallback(async () => {
    const response = await fetch("/api/officer/surveillance/outlets");
    if (response.ok) {
      const data = await response.json() as OutletRow[];
      setOutlets(data);
    }
  }, []);

  useEffect(() => {
    loadOutlets().catch(() => toast.error("Could not load outlets"));
  }, [loadOutlets]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const surveyedPrice = parseFloat(form.price);
    const controlledPrice = form.controlled ? parseFloat(form.controlled) : surveyedPrice;
    if (isNaN(surveyedPrice)) {
      toast.error("Enter a valid surveyed price");
      return;
    }
    try {
      const { id } = await addPriceEntry({
        product: form.product,
        unit: form.unit || "each",
        supplier: form.supplier,
        surveyedPrice,
        controlledPrice,
        lastUpdated: form.date || new Date().toISOString().slice(0, 10),
        category: form.category,
      });
      onPricesChange([
        {
          id,
          product: form.product,
          unit: form.unit || "each",
          supplier: form.supplier,
          surveyedPrice,
          controlledPrice,
          lastUpdated: form.date || new Date().toISOString().slice(0, 10),
          category: form.category,
          history: [],
          outletId: form.outletId || null,
          breachStatus: surveyedPrice > controlledPrice ? "open" : null,
        },
        ...prices,
      ]);
      setForm(EMPTY_PRICE);
      toast.success("Price survey recorded", {
        description: `${form.product} at ${money(surveyedPrice)}.`,
      });
    } catch {
      toast.error("Could not save price. Please try again.");
    }
  };

  const setField = (key: keyof typeof EMPTY_PRICE, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleBreachUpdate = async (
    priceEntry: PriceEntry,
    breachStatus: NonNullable<PriceEntry["breachStatus"]>
  ) => {
    try {
      const response = await fetch(`/api/officer/prices/${priceEntry.id}/breach`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breachStatus }),
      });
      if (!response.ok) throw new Error("Failed");
      const updated = await response.json() as PriceEntry;
      onPricesChange(
        prices.map((existingEntry) =>
          existingEntry.id === updated.id ? { ...existingEntry, breachStatus: updated.breachStatus } : existingEntry
        )
      );
      setBreachDialogEntry(null);
      toast.success(`Breach ${BREACH_LABELS[breachStatus].toLowerCase()}`, {
        description: priceEntry.product,
      });
    } catch {
      toast.error("Could not update breach status. Please try again.");
    }
  };

  // Outlet summary: breach count per outlet
  const outletBreachCounts = outlets.reduce<Record<string, number>>(
    (accumulator, outlet) => {
      accumulator[outlet.id] = prices.filter(
        (price) => price.outletId === outlet.id && price.breachStatus === "open"
      ).length;
      return accumulator;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Outlet summary strip */}
      {outlets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="rounded-md border border-border bg-white px-4 py-3"
            >
              <p className="truncate text-[0.8125rem] font-medium text-ink">{outlet.name}</p>
              <p className="mt-0.5 text-[0.75rem] text-g-500 capitalize">{outlet.type}</p>
              <p className="mt-1 text-[0.75rem] text-g-500">
                {outlet.lastSurveyedAt
                  ? `Surveyed ${new Date(outlet.lastSurveyedAt).toLocaleDateString("en-LC", { day: "numeric", month: "short" })}`
                  : "Not yet surveyed"}
              </p>
              {outletBreachCounts[outlet.id] > 0 && (
                <div className="mt-1.5 flex items-center gap-1 text-[0.75rem] text-flag">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  {outletBreachCounts[outlet.id]} breach{outletBreachCounts[outlet.id] > 1 ? "es" : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <form
          onSubmit={handleSubmit}
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
            {outlets.length > 0 && (
              <Field id="p-outlet" label="Outlet" hint="Optional: tag this entry to an outlet">
                <Select
                  value={form.outletId}
                  onValueChange={(value) => setField("outletId", value === "none" ? "" : value)}
                >
                  <SelectTrigger id="p-outlet">
                    <SelectValue placeholder="Select an outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific outlet</SelectItem>
                    {outlets.map((outlet) => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        {outlet.name}, {outlet.zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field id="p-product" label="Product">
              <Input
                id="p-product"
                required
                value={form.product}
                onChange={(event) => setField("product", event.target.value)}
                placeholder="White Rice"
              />
            </Field>
            <Field id="p-unit" label="Unit or pack size" hint="For example, 1 kg or 500 ml">
              <Input
                id="p-unit"
                value={form.unit}
                onChange={(event) => setField("unit", event.target.value)}
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
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <Field id="p-controlled" label="Legal max" optional>
                <Input
                  id="p-controlled"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.controlled}
                  onChange={(event) => setField("controlled", event.target.value)}
                  placeholder="0.00"
                />
              </Field>
            </div>
            <Field id="p-supplier" label="Shop or supplier">
              <Input
                id="p-supplier"
                required
                value={form.supplier}
                onChange={(event) => setField("supplier", event.target.value)}
                placeholder="Island Mart"
              />
            </Field>
            <Field id="p-date" label="Date surveyed">
              <DatePicker
                id="p-date"
                value={form.date}
                onChange={(value) => setField("date", value)}
                placeholder="Choose the survey date"
                disableFuture
              />
            </Field>
            <Field id="p-category" label="Category">
              <Select
                value={form.category}
                onValueChange={(value) => setField("category", value)}
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
          <div className="border-t border-border px-5 py-4">
            <Button type="submit" className="w-full">
              <Plus aria-hidden="true" />
              Record survey
            </Button>
          </div>
        </form>

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
                <TableHead scope="col">Breach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.slice(0, 12).map((priceEntry) => {
                const overLimit = priceEntry.surveyedPrice > priceEntry.controlledPrice;
                return (
                  <TableRow key={priceEntry.id}>
                    <TableCell>
                      <span className="block font-medium text-ink">{priceEntry.product}</span>
                      <span className="text-[0.8125rem] text-g-600">
                        {priceEntry.unit} · {priceEntry.supplier}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${overLimit ? "text-flag" : "text-ink"}`}
                      data-numeric=""
                    >
                      {money(priceEntry.surveyedPrice)}
                    </TableCell>
                    <TableCell className="text-right text-g-700" data-numeric="">
                      {money(priceEntry.controlledPrice)}
                    </TableCell>
                    <TableCell>
                      <Sparkline data={priceEntry.history} width={64} height={22} />
                    </TableCell>
                    <TableCell>
                      <PriceStatusBadge overLimit={overLimit} />
                    </TableCell>
                    <TableCell>
                      {priceEntry.breachStatus ? (
                        <button
                          onClick={() => setBreachDialogEntry(priceEntry)}
                          className="focus:outline-none"
                          aria-label={`Manage breach for ${priceEntry.product}`}
                        >
                          <Badge
                            variant="outline"
                            className={BREACH_BADGE_CLASS[priceEntry.breachStatus]}
                          >
                            {BREACH_LABELS[priceEntry.breachStatus]}
                          </Badge>
                        </button>
                      ) : (
                        <span className="text-[0.8125rem] text-g-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Breach management dialog */}
      <Dialog
        open={breachDialogEntry !== null}
        onOpenChange={(open) => {
          if (!open) setBreachDialogEntry(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage breach</DialogTitle>
          </DialogHeader>
          {breachDialogEntry && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-ink">{breachDialogEntry.product}</p>
                <p className="text-[0.8125rem] text-g-600">
                  {breachDialogEntry.supplier} ·{" "}
                  <span className="text-flag font-medium">
                    Surveyed {money(breachDialogEntry.surveyedPrice)}
                  </span>{" "}
                  vs. limit {money(breachDialogEntry.controlledPrice)}
                </p>
              </div>
              <div>
                <p className="mb-2 text-[0.8125rem] font-medium text-g-700">
                  Current status:{" "}
                  {breachDialogEntry.breachStatus && (
                    <Badge
                      variant="outline"
                      className={BREACH_BADGE_CLASS[breachDialogEntry.breachStatus]}
                    >
                      {BREACH_LABELS[breachDialogEntry.breachStatus]}
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-wrap gap-2">
            {breachDialogEntry?.breachStatus !== "under_investigation" && (
              <Button
                variant="outline"
                onClick={() =>
                  breachDialogEntry &&
                  handleBreachUpdate(breachDialogEntry, "under_investigation")
                }
              >
                <AlertTriangle className="mr-2 h-4 w-4" aria-hidden="true" />
                Open investigation
              </Button>
            )}
            {breachDialogEntry?.breachStatus !== "resolved" && (
              <Button
                onClick={() =>
                  breachDialogEntry &&
                  handleBreachUpdate(breachDialogEntry, "resolved")
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Mark resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
