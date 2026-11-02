"use client";

import { X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { dismissToast, toastStore, type ToastKind } from "./toast-store";

const KIND_CLASSES: Record<ToastKind, string> = {
  success: "bg-success text-success-foreground",
  error: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-info text-info-foreground",
};

/** Região viva (aria-live) que anuncia mensagens sem roubar o foco. Montar uma única vez no layout. */
export function Toaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getServerSnapshot);
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} role={t.kind === "error" ? "alert" : "status"} className={cn("pointer-events-auto flex items-start gap-2 rounded-lg border p-3 text-sm shadow-md", KIND_CLASSES[t.kind])}>
          <p className="flex-1">{t.message}</p>
          <button type="button" aria-label="Fechar notificação" onClick={() => dismissToast(t.id)} className="rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
