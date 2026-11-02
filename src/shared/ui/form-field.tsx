import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  /** Mensagens de erro (ex.: fieldErrors do Result). */
  errors?: string[];
  hint?: string;
  required?: boolean;
  /** Recebe os ids/atributos ARIA para ligar ao controle. */
  children: (controlProps: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}

/** Rótulo + controle + mensagens, com associação ARIA correta. */
export function FormField({ label, errors, hint, required, children }: FormFieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-primary">
        {label}
        {required ? <span aria-hidden className="text-destructive"> *</span> : null}
      </label>
      {children({ id, "aria-describedby": hasError || hint ? messageId : undefined, "aria-invalid": hasError || undefined })}
      <div id={messageId} className={cn("text-xs", hasError ? "text-destructive" : "text-muted-foreground")} role={hasError ? "alert" : undefined}>
        {hasError ? errors!.join(" ") : hint}
      </div>
    </div>
  );
}

/** Select nativo estilizado (acessível por padrão). */
export function SelectControl({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn("h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none", className)} {...props} />;
}

export function TextareaControl({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn("min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none", className)} {...props} />;
}
