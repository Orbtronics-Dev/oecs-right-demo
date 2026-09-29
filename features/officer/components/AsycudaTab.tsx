"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AsycudaSyncLogEntry {
  id: string;
  triggeredAt: string;
  triggeredBy: string;
  status: "success" | "error" | "running";
  recordsProcessed: number;
  errors: number;
  notes: string;
}

interface AsycudaStatusResponse {
  latest: AsycudaSyncLogEntry | null;
  log: AsycudaSyncLogEntry[];
}

const STATUS_BADGE_CLASS: Record<AsycudaSyncLogEntry["status"], string> = {
  success: "bg-green-100 text-green-800 border-green-200",
  error: "bg-red-100 text-red-800 border-red-200",
  running: "bg-blue-100 text-blue-800 border-blue-200",
};

const STATUS_LABELS: Record<AsycudaSyncLogEntry["status"], string> = {
  success: "Success",
  error: "Error",
  running: "Running",
};

function formatDateTime(isoString: string) {
  return new Date(isoString).toLocaleString("en-LC", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AsycudaTab() {
  const [statusData, setStatusData] = useState<AsycudaStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/officer/asycuda/status");
    if (response.ok) {
      const data = await response.json() as AsycudaStatusResponse;
      setStatusData(data);
    }
  }, []);

  useEffect(() => {
    loadStatus()
      .catch(() => toast.error("Could not load ASYCUDA status"))
      .finally(() => setLoadingStatus(false));
  }, [loadStatus]);

  // Poll while a sync is running so the UI updates when it completes
  useEffect(() => {
    const latestIsRunning = statusData?.latest?.status === "running";
    if (latestIsRunning && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        loadStatus().catch(() => null);
      }, 2000);
    } else if (!latestIsRunning && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [statusData?.latest?.status, loadStatus]);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const response = await fetch("/api/officer/asycuda/trigger", { method: "POST" });
      if (!response.ok) throw new Error("Failed");
      await loadStatus();
      toast.info("Manual sync triggered", { description: "Pulling import records from ASYCUDA World." });
    } catch {
      toast.error("Could not trigger sync. Please try again.");
    } finally {
      setTriggering(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = [".csv", ".xml"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(extension)) {
      toast.error("Only .csv and .xml files are accepted");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/officer/asycuda/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed");
      const logEntry = await response.json() as AsycudaSyncLogEntry;
      await loadStatus();
      toast.success("Flat-file upload complete", {
        description: `${logEntry.recordsProcessed} records imported from ${file.name}`,
      });
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { latest, log } = statusData ?? { latest: null, log: [] };

  return (
    <div className="space-y-6">
      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle>ASYCUDA World integration</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          ) : latest ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[0.75rem] uppercase tracking-[0.12em] text-g-600">
                    Last sync
                  </p>
                  <p className="mt-1 text-[0.9375rem] font-medium text-ink">
                    {formatDateTime(latest.triggeredAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.75rem] uppercase tracking-[0.12em] text-g-600">
                    Status
                  </p>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[latest.status]}
                    >
                      {STATUS_LABELS[latest.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[0.75rem] uppercase tracking-[0.12em] text-g-600">
                    Records processed
                  </p>
                  <p className="mt-1 text-[0.9375rem] font-medium text-ink" data-numeric="">
                    {latest.recordsProcessed.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[0.75rem] uppercase tracking-[0.12em] text-g-600">
                    Errors
                  </p>
                  <p
                    className={`mt-1 text-[0.9375rem] font-medium ${latest.errors > 0 ? "text-flag" : "text-ok"}`}
                    data-numeric=""
                  >
                    {latest.errors}
                  </p>
                </div>
              </div>

              {latest.status === "error" && (
                <Alert variant="destructive">
                  <AlertDescription>{latest.notes}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleTrigger}
                  disabled={triggering || latest.status === "running"}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${triggering || latest.status === "running" ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  {triggering || latest.status === "running"
                    ? "Syncing…"
                    : "Trigger manual sync"}
                </Button>

                <Button
                  variant="secondary"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  {uploading ? "Uploading…" : "Upload flat file"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xml"
                  className="sr-only"
                  onChange={handleUpload}
                  aria-label="Upload ASYCUDA flat file"
                />
              </div>
            </div>
          ) : (
            <p className="text-g-600">No sync activity recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Sync log table */}
      <div className="overflow-hidden rounded-md border border-border bg-white">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold text-ink">Sync log</h3>
          <p className="mt-0.5 text-[0.8125rem] text-g-600">
            All synchronisation events, most recent first
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-g-100">
              <TableHead scope="col">Date / Time</TableHead>
              <TableHead scope="col">Triggered by</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">Records</TableHead>
              <TableHead scope="col">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {log.map((logEntry) => (
              <TableRow key={logEntry.id}>
                <TableCell className="text-[0.8125rem]">
                  {formatDateTime(logEntry.triggeredAt)}
                </TableCell>
                <TableCell className="text-[0.8125rem] text-g-700">
                  {logEntry.triggeredBy}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={STATUS_BADGE_CLASS[logEntry.status]}
                  >
                    {STATUS_LABELS[logEntry.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-[0.8125rem]" data-numeric="">
                  {logEntry.recordsProcessed.toLocaleString()}
                </TableCell>
                <TableCell className="max-w-xs text-[0.8125rem] text-g-600">
                  {logEntry.notes}
                </TableCell>
              </TableRow>
            ))}
            {log.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-g-500">
                  No sync events yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
