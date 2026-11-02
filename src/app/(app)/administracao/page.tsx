import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = { title: "Administração" };

const LINKS = [
  { href: "/conselhos", title: "Conselhos", text: "Cadastro e consulta de conselhos." },
  { href: "/administracao/auditoria", title: "Auditoria", text: "Trilha append-only de ações e negativas." },
  { href: "/administracao/retencao", title: "Retenção documental", text: "Elegibilidade de limpeza, autorizações e bloqueios." },
];

/** Hub estático: o acesso real é imposto nas páginas filhas e nos serviços. */
export default function AdministrationPage() {
  return (
    <>
      <PageHeader title="Administração" description="Funções restritas à administração central." />
      <ul className="grid gap-4 md:grid-cols-3">
        {LINKS.map((l) => (
          <li key={l.href}><Link href={l.href} className="block rounded-lg border p-4 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"><p className="font-medium">{l.title}</p><p className="text-sm text-muted-foreground">{l.text}</p></Link></li>
        ))}
      </ul>
    </>
  );
}
