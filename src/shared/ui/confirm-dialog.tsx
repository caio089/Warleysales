"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  /** Elemento que abre o diálogo (botão). */
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ação destrutiva usa estilo de alerta. */
  destructive?: boolean;
  /** Executada ao confirmar; o diálogo fecha ao terminar com sucesso. */
  onConfirm: () => void | Promise<void>;
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

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger render={<span className="inline-flex" />}>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/30" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-popover p-6 text-popover-foreground shadow-lg outline-none">
          <AlertDialog.Title className="text-base font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">{description}</AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
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
