"use client";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/modules/identity/actions";
import { FormField } from "@/shared/ui/form-field";
import { ActionForm } from "@/shared/ui/forms/action-form";

/** Campo com ícone à esquerda, mantendo o foco e o rótulo associados. */
function FieldShell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden>
        {icon}
      </span>
      {children}
    </div>
  );
}

export function LoginForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <ActionForm
      action={signInAction}
      submitLabel="Acessar o portal"
      pendingLabel="Entrando…"
      submitClassName="mt-1 h-11 w-full text-[0.95rem]"
    >
      {(errors) => (
        <>
          <FormField label="E-mail" required errors={errors.email}>
            {(props) => (
              <FieldShell icon={<Mail className="size-4" />}>
                <Input
                  {...props}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nome@conselho.org"
                  required
                  className="h-11 bg-background/70 pl-10"
                />
              </FieldShell>
            )}
          </FormField>
          <FormField
            label="Senha"
            required
            errors={errors.password}
            aside={
              <Link
                href="/recuperar-senha"
                className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-highlight hover:underline"
              >
                Esqueci minha senha
              </Link>
            }
          >
            {(props) => (
              <FieldShell icon={<LockKeyhole className="size-4" />}>
                <Input
                  {...props}
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  required
                  className="h-11 bg-background/70 pr-11 pl-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((current) => !current)}
                >
                  {passwordVisible ? <EyeOff /> : <Eye />}
                </Button>
              </FieldShell>
            )}
          </FormField>
        </>
      )}
    </ActionForm>
  );
}
