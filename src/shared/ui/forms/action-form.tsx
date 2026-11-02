"use client";

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
  submitVariant?: "default" | "destructive" | "outline";
  /**
   * Nome de um campo oculto com chave de idempotência. A chave é gerada no cliente após a
   * montagem (evita divergência de hidratação) e renovada após cada sucesso; em caso de erro
   * ou duplo clique a mesma chave é reenviada e o servidor não duplica a operação.
   */
  idempotencyField?: string;
}

/** Formulário que usa Server Action, mostra erros por campo e avisa por toast. */
export function ActionForm({ action, submitLabel, children, hiddenFields, submitVariant = "default", idempotencyField }: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, IDLE_STATE);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  /** Gera uma nova chave de idempotência diretamente no DOM (sem estado: evita divergência de hidratação). */
  const renewKey = useCallback(() => {
    const input = formRef.current?.elements.namedItem(idempotencyField ?? "") as HTMLInputElement | null;
    if (input) input.value = crypto.randomUUID();
  }, [idempotencyField]);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
    if (state.status === "success") {
      formRef.current?.reset(); // limpa os campos somente após sucesso
      if (idempotencyField) renewKey();
    }
  }, [state, idempotencyField, renewKey]);

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
      <Button type="submit" variant={submitVariant} disabled={pending}>{pending ? "Salvando…" : submitLabel}</Button>
    </form>
  );
}

/** Botão de ação única (ex.: "Aprovar") ligado a uma Server Action, com confirmação opcional via ConfirmDialog. */
export function ActionButton({ action, label, hiddenFields, variant = "default" }: { action: ActionFormProps["action"]; label: string; hiddenFields: Record<string, string>; variant?: "default" | "destructive" | "outline" }) {
  return (
    <ActionForm action={action} submitLabel={label} hiddenFields={hiddenFields} submitVariant={variant}>
      {() => null}
    </ActionForm>
  );
}
