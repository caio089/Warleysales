import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Building2, FileClock, ScrollText, UsersRound } from "lucide-react";
import { loadScreen } from "@/server/screen";
import { fail, ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";

export const metadata: Metadata = { title: "Administração" };

const LINKS = [
  { href: "/conselhos", title: "Órgãos e empresas", text: "Cadastre e consulte as organizações atendidas.", icon: Building2 },
  { href: "/administracao/usuarios", title: "Usuários e vínculos", text: "Defina o papel de cada pessoa por órgão.", icon: UsersRound },
  { href: "/administracao/auditoria", title: "Auditoria", text: "Consulte ações, responsáveis e alterações.", icon: ScrollText },
  { href: "/administracao/retencao", title: "Retenção documental", text: "Acompanhe prazos, autorizações e bloqueios.", icon: FileClock },
];

async function Content() {
  const result = await loadScreen(async ({ actor }) => {
    if (!actor.isCentralAdmin) return fail("FORBIDDEN", "Administração restrita ao admin central.");
    return ok(true);
  });
  return (
    <Screen result={result}>
      {() => (
        <div>
        <div className="mb-4"><SectionLabel>Áreas de gestão</SectionLabel></div>
        <ul className="grid gap-4 md:grid-cols-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="surface-card card-hover group flex min-h-40 flex-col p-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <span className="mb-5 flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><l.icon className="size-5" aria-hidden /></span><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></span>
                <p className="font-heading text-lg font-medium tracking-tight text-primary">{l.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.text}</p>
              </Link>
            </li>
          ))}
        </ul>
        </div>
      )}
    </Screen>
  );
}

export default function AdministrationPage() {
  return (
    <>
      <PageHeader eyebrow="Gestão · Configurações" title="Administração" description="Acesse os cadastros, controles e registros reservados à administração central." />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
