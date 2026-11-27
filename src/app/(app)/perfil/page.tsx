import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = { title: "Meu perfil" };

export default function ProfilePage() {
  return <>
    <PageHeader title="Meu perfil" />
    <Link className={buttonVariants()} href="/administracao/usuarios#vincular-usuario">Gerenciar usuários</Link>
  </>;
}
