import type { Metadata } from "next";
import Link from "next/link";
import { RecoveryForm } from "./recovery-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecoveryPage() {
  return (
    <>
      <RecoveryForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">Voltar ao login</Link>
      </p>
    </>
  );
}
