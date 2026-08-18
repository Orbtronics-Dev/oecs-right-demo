import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfficerHeaderProps {
  name: string;
  role?: string;
}

export default function OfficerHeader({ name, role = "Consumer Affairs Officer" }: OfficerHeaderProps) {
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
          <div className="hidden text-right sm:block">
            <p className="text-[0.9375rem] font-semibold leading-tight">{name}</p>
            <p className="text-[0.8125rem] text-white/65">{role}</p>
          </div>
          <Button asChild variant="inverseOutline" size="sm">
            <Link href="/">
              <LogOut aria-hidden="true" />
              Sign out
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
