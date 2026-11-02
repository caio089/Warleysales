import type { ReactNode } from "react";
import { DataSourceUnavailableState, ErrorState, ForbiddenState } from "@/shared/ui/feedback-states";
import { notFound } from "next/navigation";
import type { ScreenResult } from "@/server/screen";

/** Converte o resultado de carregamento em UI: conteúdo, sem fonte de dados, sem permissão ou erro. */
export function Screen<T>({ result, children }: { result: ScreenResult<T>; children: (data: T) => ReactNode }) {
  switch (result.kind) {
    case "ok":
      return <>{children(result.data)}</>;
    case "unconfigured":
      return <DataSourceUnavailableState />;
    case "forbidden":
      return <ForbiddenState />;
    case "not_found":
      notFound();
      return null;
    case "error":
      return <ErrorState description={result.message} />;
  }
}
