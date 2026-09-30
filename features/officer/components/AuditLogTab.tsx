"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLogEntry {
  id: string;
  tableName: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  rowId: string;
  changedBy: string;
  changedAt: string;
  description: string;
}

const MODULE_LABELS: Record<string, string> = {
  complaints: "Cases",
  prices: "Surveillance",
  calculations: "Price Control",
  markup_params: "Markup Params",
  asycuda_log: "ASYCUDA",
  feature_flags: "Settings",
  outlets: "Outlets",
};

const OPERATION_VARIANTS: Record<string, "default" | "outline" | "secondary" | "destructive"> = {
  INSERT: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-LC", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogTab() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/officer/audit-log")
      .then((r) => r.json() as Promise<AuditLogEntry[]>)
      .then(setEntries)
      .catch(() => toast.error("Could not load audit log"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h2 className="text-[0.9375rem] font-semibold text-ink">Audit log</h2>
        <p className="mt-1 text-[0.8125rem] text-g-600">
          All write operations to sensitive tables, recorded at the database level. Append-only — entries cannot be modified or deleted.
        </p>
      </div>

      <div className="rounded-md border border-g-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Officer</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-[0.8125rem] text-g-600">
                      {formatTimestamp(entry.changedAt)}
                    </TableCell>
                    <TableCell className="font-mono text-[0.8125rem]">
                      {entry.changedBy}
                    </TableCell>
                    <TableCell className="text-[0.8125rem]">
                      {MODULE_LABELS[entry.tableName] ?? entry.tableName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={OPERATION_VARIANTS[entry.operation] ?? "outline"}>
                        {entry.operation}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[0.8125rem]">
                      {entry.description}
                    </TableCell>
                  </TableRow>
                ))}

            {!loading && entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-[0.8125rem] text-g-500">
                  No audit entries recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
