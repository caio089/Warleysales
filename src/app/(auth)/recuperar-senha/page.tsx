import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/shared/ui/auth-stage";
import { RecoveryForm } from "./recovery-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecoveryPage() {
  return (
    <>
      <AuthHeading title="Recuperar senha" description="Enviaremos um link se o e-mail estiver cadastrado." />
      <RecoveryForm />
      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="text-primary underline-offset-4 transition-colors hover:text-highlight hover:underline">Voltar ao login</Link>
      </p>
    </>
  );
}
