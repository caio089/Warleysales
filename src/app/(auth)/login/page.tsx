import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/recuperar-senha" className="text-primary underline-offset-4 hover:underline">Esqueci minha senha</Link>
      </p>
    </>
  );
}
