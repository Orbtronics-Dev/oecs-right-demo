"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
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
import { CaseStatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import type { Complaint, CaseStatus } from "@/features/complaints/types";
import CaseDialog from "./CaseDialog";
import { updateCase } from "../services/officer";

const STATUSES: CaseStatus[] = ["Submitted", "Under Review", "Investigation", "Resolved"];

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

interface CasesTabProps {
  complaints: Complaint[];
  onComplaintsChange: (updated: Complaint[]) => void;
}

export default function CasesTab({ complaints, onComplaintsChange }: CasesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [openCase, setOpenCase] = useState<Complaint | null>(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchesTerm =
        !term ||
        c.caseRef.toLowerCase().includes(term) ||
        c.consumerName.toLowerCase().includes(term) ||
        c.businessName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "All statuses" || c.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  const handleSave = async (id: string, status: CaseStatus, note: string) => {
    const updated = await updateCase(id, { status, note });
    onComplaintsChange(complaints.map((c) => (c.id === updated.id ? updated : c)));
    toast.success(`Case ${updated.caseRef} updated`, { description: `Status set to ${status}.` });
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="case-search" className="sr-only">Search cases</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-g-600" aria-hidden="true" />
          <Input id="case-search" className="pl-9" placeholder="Search by case reference, consumer, or business" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="sm:w-52">
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["All statuses", ...STATUSES].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="secondary" onClick={() => toast.success("Case export queued")}>
          <Download aria-hidden="true" />Export
        </Button>
      </div>

      <p className="mt-4 text-sm text-g-600" aria-live="polite">
        Showing <strong className="font-semibold text-ink" data-numeric="">{visible.length}</strong> of {complaints.length} cases
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
              <TableHead scope="col"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow className="hover:bg-white">
                <TableCell colSpan={8} className="py-12 text-center text-g-600">No cases match your search.</TableCell>
              </TableRow>
            ) : (
              visible.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-nowrap font-semibold text-ink" data-numeric="">{c.caseRef}</TableCell>
                  <TableCell className="text-[0.9375rem]">{c.consumerName}</TableCell>
                  <TableCell className="text-[0.9375rem] text-g-700">{c.businessName}</TableCell>
                  <TableCell className="text-[0.9375rem] text-g-700">{c.category}</TableCell>
                  <TableCell className="whitespace-nowrap text-[0.9375rem] text-g-600" data-numeric="">{formatDate(c.dateFiled)}</TableCell>
                  <TableCell className="text-[0.9375rem] text-g-700">{c.assignedOfficer || <span className="italic text-g-600">Unassigned</span>}</TableCell>
                  <TableCell><CaseStatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setOpenCase(c)}>Open</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CaseDialog complaint={openCase} onClose={() => setOpenCase(null)} onSave={handleSave} />
    </>
  );
}
