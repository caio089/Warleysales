import type { Metadata } from "next";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Definir senha" };

export default function PasswordPage() {
  return <PasswordForm />;
}
