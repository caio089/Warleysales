import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/shared/ui/auth-stage";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <AuthHeading title="Entrar" description="Use o e-mail e a senha da sua conta convidada." />
      <LoginForm />
      <p className="mt-5 text-center text-sm">
        <Link href="/recuperar-senha" className="text-primary underline-offset-4 transition-colors hover:text-highlight hover:underline">
          Esqueci minha senha
        </Link>
      </p>
    </>
  );
}
