"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Field from "@/components/field";
import { CaseStatusBadge } from "@/components/status-badge";
import type { Complaint, CaseStatus } from "@/features/complaints/types";

const STATUSES: CaseStatus[] = ["Submitted", "Under Review", "Investigation", "Resolved"];

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

interface CaseDialogProps {
  complaint: Complaint | null;
  onClose: () => void;
  onSave: (id: string, status: CaseStatus, note: string) => Promise<void>;
}

export default function CaseDialog({ complaint, onClose, onSave }: CaseDialogProps) {
  const [draftStatus, setDraftStatus] = useState<CaseStatus>(complaint?.status ?? "Submitted");
  const [draftNote, setDraftNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!complaint) return;
    setSaving(true);
    try {
      await onSave(complaint.id, draftStatus, draftNote);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={Boolean(complaint)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        {complaint && (
          <>
            <DialogHeader>
              <DialogTitle>
                <span data-numeric="">{complaint.caseRef}</span>
                <span className="ml-2 text-[0.9375rem] font-normal text-g-600">{complaint.category}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-g-50 px-4 py-3">
              <span className="text-sm text-g-600">Current status</span>
              <CaseStatusBadge status={complaint.status} />
            </div>

            <dl className="grid gap-x-5 gap-y-3.5 sm:grid-cols-2">
              {[
                ["Consumer", complaint.consumerName],
                ["Contact", `${complaint.email} · ${complaint.phone ?? "—"}`],
                ["Business", complaint.businessName],
                ["Business address", complaint.businessAddress ?? "—"],
                ["Date filed", formatDate(complaint.dateFiled)],
                ["Assigned officer", complaint.assignedOfficer || "Unassigned"],
              ].map(([term, value]) => (
                <div key={term}>
                  <dt className="text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">{term}</dt>
                  <dd className="mt-0.5 text-[0.9375rem] break-words text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-border pt-4">
              <h3 className="text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">Consumer&rsquo;s account</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">{complaint.description}</p>
            </div>

            {complaint.notes.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">Case notes</h3>
                <ol className="mt-2 space-y-2">
                  {complaint.notes.map((note, index) => (
                    <li key={index} className="rounded-sm border-l-2 border-l-brand-green bg-g-50 px-3 py-2 text-[0.9375rem] text-ink">{note}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="text-[0.9375rem] font-semibold text-ink">Update this case</h3>
              <Field id="draft-status" label="Status">
                <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as CaseStatus)}>
                  <SelectTrigger id="draft-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="draft-note" label="Add a case note" hint="Internal only — not shown to the consumer." optional>
                <Textarea id="draft-note" rows={3} value={draftNote} onChange={(e) => setDraftNote(e.target.value)} placeholder="Contacted the business; awaiting price records." />
              </Field>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={onClose}>
                  <X aria-hidden="true" />Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <CheckCircle2 aria-hidden="true" />
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
