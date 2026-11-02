/** Armazém mínimo de toasts (sem dependências), compatível com useSyncExternalStore. */
export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  message: string;
}

let nextId = 1;
let toasts: readonly ToastMessage[] = [];
const EMPTY: readonly ToastMessage[] = [];
const listeners = new Set<() => void>();

function emit(next: readonly ToastMessage[]) {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export const toastStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
  getServerSnapshot: (): readonly ToastMessage[] => EMPTY,
};

export function dismissToast(id: number): void {
  emit(toasts.filter((t) => t.id !== id));
}

/** Exibe um toast e o remove automaticamente após `durationMs`. */
export function showToast(kind: ToastKind, message: string, durationMs = 5000): number {
  const id = nextId++;
  emit([...toasts, { id, kind, message }]);
  if (durationMs > 0) setTimeout(() => dismissToast(id), durationMs);
  return id;
}

export const toast = {
  success: (message: string) => showToast("success", message),
  error: (message: string) => showToast("error", message, 8000),
  info: (message: string) => showToast("info", message),
};
