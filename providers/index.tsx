"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Light-only: a public service portal reads as more official in a single,
          predictable appearance. Readers who need contrast get the high-contrast
          mode in Display options instead. */}
      <Toaster theme="light" position="bottom-center" closeButton />
    </QueryClientProvider>
  );
}
