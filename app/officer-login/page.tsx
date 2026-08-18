"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Field from "@/components/field";
import Callout from "@/components/callout";
import ServiceMark from "@/components/service-mark";

export default function OfficerLoginPage() {
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/officer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: officerId, password }),
      });
      if (res.ok) {
        router.push("/officer-dashboard");
      } else {
        const data = await res.json();
        setError(data.error ?? "Sign in failed");
      }
    } catch {
      setError("Could not connect — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-g-100 px-4 py-14">
      <div className="w-full max-w-[26rem]">
        <div className="rounded-md border border-border bg-white">
          <div className="border-b border-border px-6 py-6 text-center">
            <ServiceMark className="justify-center" />
            <h1 className="mt-5 font-serif text-[1.625rem] tracking-[-0.016em] text-ink">
              Officer portal
            </h1>
            <p className="mt-1 text-[0.9375rem] text-g-600">Staff access only</p>
          </div>

          <form className="space-y-6 px-6 py-6" onSubmit={handleSubmit}>
            <Field id="officerId" label="Officer ID">
              <Input
                id="officerId"
                value={officerId}
                onChange={(event) => setOfficerId(event.target.value)}
                autoComplete="username"
                placeholder="e.g. kwilliams"
              />
            </Field>

            <Field id="password" label="Password">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="remember"
                className="flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink"
              >
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                />
                Remember this device
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink"
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <Callout variant="warning" title="Sign in failed">
                {error}
              </Callout>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <Lock aria-hidden="true" />
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="border-t border-border px-6 py-4">
            <Callout variant="info" title="Demo credentials">
              Officer ID: <strong>kwilliams</strong> / Password: <strong>demo1234</strong>
            </Callout>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-g-600">
            <ShieldAlert className="mt-px h-4 w-4 shrink-0 text-g-600" aria-hidden="true" />
            <span>
              This system holds personal data about consumers. Access is logged and monitored.
            </span>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to the public portal
          </Link>
        </div>
      </div>
    </div>
  );
}
