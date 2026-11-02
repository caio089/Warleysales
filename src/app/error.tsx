"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/shared/ui/feedback-states";

/** Fronteira de erro global: sem detalhes técnicos para o usuário. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg p-6">
      <ErrorState description="Tente novamente. Se o problema persistir, contate o administrador." action={<Button onClick={reset}>Tentar novamente</Button>} />
    </main>
  );
}
