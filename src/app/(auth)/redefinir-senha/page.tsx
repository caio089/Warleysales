import type { Metadata } from "next";
import { AuthHeading } from "@/shared/ui/auth-stage";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Definir senha" };

export default function PasswordPage() {
  return (
    <>
      <AuthHeading title="Definir senha" description="Escolha uma senha forte para a sua conta." />
      <PasswordForm />
    </>
  );
}
