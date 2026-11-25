"use client";

import { History } from "lucide-react";
import { ActivityTimeline, type TimelineEntry } from "@/shared/ui/activity-timeline";

export interface HistoryTabProps {
  history: TimelineEntry[];
}

/** Aba Histórico — linha do tempo completa do processo com data e horário. */
export function HistoryTab({ history }: HistoryTabProps) {
  return (
    <div className="space-y-6">
      <section
        aria-labelledby="historico-heading"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
            <History className="size-5 shrink-0" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2
              id="historico-heading"
              className="font-heading text-base font-semibold text-foreground sm:text-lg"
            >
              Histórico do processo
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Tudo registrado com data e horário (Fortaleza): criação, envio da solicitação,
              aprovação, cada documento colocado (DFD, ETP, MR, TR, PP, PJ, ED), formalização e
              encerramento.
            </p>
          </div>
        </div>

        <ActivityTimeline
          entries={history}
          emptyLabel="Nenhum evento registrado neste processo ainda."
        />
      </section>
    </div>
  );
}
