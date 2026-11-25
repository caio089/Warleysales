"use client";

import { Archive } from "lucide-react";
import { unlinkDocumentFormAction } from "@/modules/documents/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";

/** Botão destacado para arquivar um anexo da pasta ativa. */
export function ArchiveDocumentButton({
  attachmentId,
  processId,
  size = "md",
}: {
  attachmentId: string;
  processId: string;
  size?: "sm" | "md";
}) {
  const compact = size === "sm";
  return (
    <ActionForm
      action={unlinkDocumentFormAction}
      submitLabel="Arquivar"
      pendingLabel="Arquivando…"
      submitVariant="secondary"
      formClassName="inline-flex"
      submitClassName={
        compact
          ? "h-8 gap-1.5 border border-border bg-card px-2.5 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          : "h-9 gap-1.5 border border-border bg-card px-3 text-sm font-semibold text-foreground shadow-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      }
      submitLeading={<Archive className={compact ? "size-3.5" : "size-4"} aria-hidden="true" />}
      hiddenFields={{ attachmentId, processId }}
      resetOnSuccess={false}
    >
      {() => null}
    </ActionForm>
  );
}
