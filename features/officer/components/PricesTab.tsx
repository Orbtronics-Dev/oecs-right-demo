"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import Field from "@/components/field";
import DatePicker from "@/components/date-picker";
import { PriceStatusBadge } from "@/components/status-badge";
import Sparkline from "@/components/charts/sparkline";
import { toast } from "sonner";
import type { PriceEntry } from "@/features/prices/types";
import { addPriceEntry } from "@/features/prices/services/prices";

const CATEGORIES = ["Food", "Fuel", "Household", "Electronics"];

const money = (v: number) => `$${v.toFixed(2)}`;

const EMPTY_PRICE = { product: "", unit: "", price: "", controlled: "", supplier: "", date: "", category: "Food" };

interface PricesTabProps {
  prices: PriceEntry[];
  onPricesChange: (updated: PriceEntry[]) => void;
}

export default function PricesTab({ prices, onPricesChange }: PricesTabProps) {
  const [form, setForm] = useState(EMPTY_PRICE);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const surveyed = parseFloat(form.price);
    const controlled = form.controlled ? parseFloat(form.controlled) : surveyed;
    if (isNaN(surveyed)) {
      toast.error("Enter a valid surveyed price");
      return;
    }
    try {
      const { id } = await addPriceEntry({
        product: form.product,
        unit: form.unit || "each",
        supplier: form.supplier,
        surveyedPrice: surveyed,
        controlledPrice: controlled,
        lastUpdated: form.date || new Date().toISOString().slice(0, 10),
        category: form.category,
      });
      onPricesChange([
        { id, product: form.product, unit: form.unit || "each", supplier: form.supplier, surveyedPrice: surveyed, controlledPrice: controlled, lastUpdated: form.date || new Date().toISOString().slice(0, 10), category: form.category, history: [] },
        ...prices,
      ]);
      setForm(EMPTY_PRICE);
      toast.success("Price survey recorded", { description: `${form.product} at ${money(surveyed)}.` });
    } catch {
      toast.error("Could not save price - please try again.");
    }
  };

  const set = (key: keyof typeof EMPTY_PRICE, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
      <form onSubmit={handleSubmit} className="rounded-md border border-border bg-white" aria-labelledby="price-entry-heading">
        <div className="border-b border-border px-5 py-4">
          <h2 id="price-entry-heading" className="font-serif text-[1.25rem] tracking-[-0.014em] text-ink">Record a price survey</h2>
          <p className="mt-1 text-[0.8125rem] text-g-600">Field entries appear on the public price page immediately.</p>
        </div>
        <div className="space-y-5 px-5 py-5">
          <Field id="p-product" label="Product">
            <Input id="p-product" required value={form.product} onChange={(event) => set("product", event.target.value)} placeholder="White Rice" />
          </Field>
          <Field id="p-unit" label="Unit or pack size" hint="For example, 1 kg or 500 ml">
            <Input id="p-unit" value={form.unit} onChange={(event) => set("unit", event.target.value)} placeholder="1 kg" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="p-price" label="Surveyed">
              <Input id="p-price" type="number" step="0.01" min="0" required value={form.price} onChange={(event) => set("price", event.target.value)} placeholder="0.00" />
            </Field>
            <Field id="p-controlled" label="Legal max" optional>
              <Input id="p-controlled" type="number" step="0.01" min="0" value={form.controlled} onChange={(event) => set("controlled", event.target.value)} placeholder="0.00" />
            </Field>
          </div>
          <Field id="p-supplier" label="Shop or supplier">
            <Input id="p-supplier" required value={form.supplier} onChange={(event) => set("supplier", event.target.value)} placeholder="Island Mart" />
          </Field>
          <Field id="p-date" label="Date surveyed">
            <DatePicker id="p-date" value={form.date} onChange={(v) => set("date", v)} placeholder="Choose the survey date" disableFuture />
          </Field>
          <Field id="p-category" label="Category">
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger id="p-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="border-t border-border px-5 py-4">
          <Button type="submit" className="w-full"><Plus aria-hidden="true" />Record survey</Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-serif text-[1.25rem] tracking-[-0.014em] text-ink">Recent surveys</h2>
          <p className="text-[0.8125rem] text-g-600" data-numeric="">{prices.length} records</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-g-100">
              <TableHead scope="col">Product</TableHead>
              <TableHead scope="col" className="text-right">Surveyed</TableHead>
              <TableHead scope="col" className="text-right">Legal max</TableHead>
              <TableHead scope="col">Trend</TableHead>
              <TableHead scope="col">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.slice(0, 12).map((priceEntry) => {
              const overLimit = priceEntry.surveyedPrice > priceEntry.controlledPrice;
              return (
                <TableRow key={priceEntry.id}>
                  <TableCell>
                    <span className="block font-medium text-ink">{priceEntry.product}</span>
                    <span className="text-[0.8125rem] text-g-600">{priceEntry.unit} · {priceEntry.supplier}</span>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${overLimit ? "text-flag" : "text-ink"}`} data-numeric="">{money(priceEntry.surveyedPrice)}</TableCell>
                  <TableCell className="text-right text-g-700" data-numeric="">{money(priceEntry.controlledPrice)}</TableCell>
                  <TableCell><Sparkline data={priceEntry.history} width={64} height={22} /></TableCell>
                  <TableCell><PriceStatusBadge overLimit={overLimit} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
