"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";

export function confirmationSucceeded(result: boolean | void): boolean {
  return result !== false;
}

interface ConfirmDialogProps {
  /** Elemento que abre o diálogo (botão). */
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ação destrutiva usa estilo de alerta. */
  destructive?: boolean;
  /** Retorna false quando ação falha; sucesso pode retornar true ou void. */
  onConfirm: () => boolean | void | Promise<boolean | void>;
}

/** Confirmação para ações irreversíveis. Foco preso, Esc fecha e leitores anunciam o título. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleConfirm() {
    setPending(true);
    setError(false);
    try {
      const result = await onConfirm();
      if (confirmationSucceeded(result)) setOpen(false);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger render={trigger} />
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-primary/25 backdrop-blur-[2px]" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/80 bg-popover p-4 sm:p-6 text-popover-foreground shadow-[0_24px_60px_-24px_oklch(0.23_0.05_250_/_0.45)] outline-none">
          <AlertDialog.Title className="font-heading text-lg font-medium tracking-tight text-primary">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">{description}</AlertDialog.Description>
          {error ? <p role="alert" className="mt-4 text-sm text-destructive">Falha inesperada. Tente novamente.</p> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <AlertDialog.Close render={<Button variant="outline" disabled={pending} />}>{cancelLabel}</AlertDialog.Close>
            <Button variant={destructive ? "destructive" : "default"} onClick={handleConfirm} disabled={pending}>
              {pending ? "Processando…" : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
