"use client";

import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useTransition, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/shared/ui/toast-store";
import { IDLE_STATE, type ActionState } from "./action-state";

interface ActionFormProps {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  /** Campos do formulário; recebe os erros por campo da última tentativa. */
  children: (fieldErrors: Record<string, string[]>) => ReactNode;
  /** Valores fixos enviados junto (ex.: id da entidade). */
  hiddenFields?: Record<string, string>;
  submitVariant?: "default" | "destructive" | "outline" | "highlight";
  submitClassName?: string;
  /** Texto do botão enquanto a action está em andamento. */
  pendingLabel?: string;
  /**
   * Nome de um campo oculto com chave de idempotência. A chave é gerada no cliente após a
   * montagem (evita divergência de hidratação) e renovada após cada sucesso; em caso de erro
   * ou duplo clique a mesma chave é reenviada e o servidor não duplica a operação.
   */
  idempotencyField?: string;
  /**
   * Limpa os campos após sucesso. Desative em formulários de edição com `defaultValue`
   * para o usuário continuar vendo o que acabou de gravar.
   */
  resetOnSuccess?: boolean;
  /** Callback opcional executado quando a Server Action retorna sucesso. */
  onSuccess?: () => void;
}

/** Formulário que usa Server Action, mostra erros por campo e avisa por toast. */
export function ActionForm({
  action,
  submitLabel,
  children,
  hiddenFields,
  submitVariant = "default",
  submitClassName,
  pendingLabel = "Gravando…",
  idempotencyField,
  resetOnSuccess = true,
  onSuccess,
}: ActionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, IDLE_STATE);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandled = useRef<ActionState>(IDLE_STATE);

  /** Gera uma nova chave de idempotência diretamente no DOM (sem estado: evita divergência de hidratação). */
  const renewKey = useCallback(() => {
    const input = formRef.current?.elements.namedItem(idempotencyField ?? "") as HTMLInputElement | null;
    if (input) input.value = crypto.randomUUID();
  }, [idempotencyField]);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.status === "success") {
      toast.success(state.message);
      if (resetOnSuccess) formRef.current?.reset();
      if (idempotencyField) renewKey();
      onSuccess?.();
      // Garante que as listas RSC mostrem o que acabou de ser gravado no banco.
      startTransition(() => router.refresh());
    }
    if (state.status === "error") toast.error(state.message);
  }, [state, idempotencyField, renewKey, resetOnSuccess, router, startTransition, onSuccess]);

  // Envio manual: evita o reset automático do React 19, que apagaria o que o usuário digitou em caso de erro.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
      {Object.entries(hiddenFields ?? {}).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      {idempotencyField ? (
        <input type="hidden" name={idempotencyField} defaultValue="" ref={(el) => { if (el && !el.value) el.value = crypto.randomUUID(); }} />
      ) : null}
      {children(fieldErrors)}
      {state.status === "error" ? <p role="alert" className="text-sm text-destructive">{state.message}</p> : null}
      {state.status === "success" ? (
        <p role="status" className="rounded-lg border border-success-foreground/20 bg-success px-3 py-2 text-sm text-success-foreground">
          {state.message} Os dados já estão no banco.
        </p>
      ) : null}
      <Button type="submit" variant={submitVariant} className={submitClassName ?? "min-w-28"} disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}

/** Botão de ação única (ex.: "Aprovar") ligado a uma Server Action. */
export function ActionButton({ action, label, hiddenFields, variant = "default" }: { action: ActionFormProps["action"]; label: string; hiddenFields: Record<string, string>; variant?: "default" | "destructive" | "outline" }) {
  return (
    <ActionForm action={action} submitLabel={label} hiddenFields={hiddenFields} submitVariant={variant} resetOnSuccess={false}>
      {() => null}
    </ActionForm>
  );
}
