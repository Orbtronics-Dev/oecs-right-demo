"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface FeatureFlagRow {
  id: string;
  flag: "price_control_visible" | "asycuda_enabled";
  enabled: boolean;
}

const FLAG_LABELS: Record<FeatureFlagRow["flag"], string> = {
  price_control_visible: "Price control visible",
  asycuda_enabled: "ASYCUDA integration enabled",
};

const FLAG_DESCRIPTIONS: Record<FeatureFlagRow["flag"], string> = {
  price_control_visible:
    "Show price control features on the public-facing site. Disable to hide the MRP module while awaiting a legislative amendment.",
  asycuda_enabled:
    "Use the automated ASYCUDA World pull path instead of requiring manual flat-file uploads.",
};

export default function SettingsTab() {
  const [flags, setFlags] = useState<FeatureFlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const loadFlags = useCallback(async () => {
    const response = await fetch("/api/officer/settings/flags");
    if (response.ok) {
      const data = await response.json() as FeatureFlagRow[];
      setFlags(data);
    }
  }, []);

  useEffect(() => {
    loadFlags()
      .catch(() => toast.error("Could not load settings"))
      .finally(() => setLoading(false));
  }, [loadFlags]);

  const handleToggle = async (flagRow: FeatureFlagRow, enabled: boolean) => {
    setSaving((previous) => ({ ...previous, [flagRow.flag]: true }));
    try {
      const response = await fetch(`/api/officer/settings/flags/${flagRow.flag}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error("Failed");
      const updated = await response.json() as FeatureFlagRow;
      setFlags((previous) =>
        previous.map((existingFlag) =>
          existingFlag.flag === updated.flag ? updated : existingFlag
        )
      );
      toast.success(`${FLAG_LABELS[flagRow.flag]} ${enabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Could not update setting. Please try again.");
    } finally {
      setSaving((previous) => ({ ...previous, [flagRow.flag]: false }));
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {flags.map((flagRow, index) => (
                <div key={flagRow.flag}>
                  {index > 0 && <Separator />}
                  <div className="flex items-start justify-between gap-6 px-6 py-5">
                    <div>
                      <Label
                        htmlFor={`flag-${flagRow.flag}`}
                        className="text-[0.9375rem] font-semibold text-ink"
                      >
                        {FLAG_LABELS[flagRow.flag]}
                      </Label>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-g-600">
                        {FLAG_DESCRIPTIONS[flagRow.flag]}
                      </p>
                    </div>
                    <Switch
                      id={`flag-${flagRow.flag}`}
                      checked={flagRow.enabled}
                      disabled={saving[flagRow.flag]}
                      onCheckedChange={(enabled) => handleToggle(flagRow, enabled)}
                      aria-label={FLAG_LABELS[flagRow.flag]}
                    />
                  </div>
                </div>
              ))}
              {flags.length === 0 && (
                <p className="px-6 py-5 text-g-500">No feature flags configured.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
