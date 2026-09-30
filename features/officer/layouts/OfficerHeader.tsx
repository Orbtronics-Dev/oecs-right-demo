"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { officerSignOut } from "../services/officer";

interface OfficerHeaderProps {
  name: string;
  role?: string;
}

export default function OfficerHeader({ name, role = "Consumer Affairs Officer" }: OfficerHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    await officerSignOut();
    router.push("/officer-login");
  }

  return (
    <div data-on-ink className="bg-ink text-white">
      <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="eyebrow text-white/60">Consumer Affairs Division</p>
          <h1 className="mt-1.5 font-serif text-[1.75rem] leading-none tracking-[-0.018em]">
            Officer dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {name && (
            <div className="hidden text-right sm:block">
              <p className="text-[0.9375rem] font-semibold leading-tight">{name}</p>
              <p className="text-[0.8125rem] text-white/65">{role}</p>
            </div>
          )}
          <Button variant="inverseOutline" size="sm" onClick={handleSignOut}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
