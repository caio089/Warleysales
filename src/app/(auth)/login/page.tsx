import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AuthHeading } from "@/shared/ui/auth-stage";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Acesso seguro"
        title="Bem-vindo de volta"
        description="Use o e-mail do convite para entrar no ambiente do conselho."
      />
      <LoginForm />
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs tracking-wide text-muted-foreground">
        <ShieldCheck className="size-3.5 text-highlight" aria-hidden />
        Sessão protegida · somente contas convidadas
      </p>
    </>
  );
}
