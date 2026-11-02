import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { fail, ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";

export const metadata: Metadata = { title: "Administração" };

const LINKS = [
  { href: "/conselhos", title: "Conselhos", text: "Cadastro e consulta de conselhos." },
  { href: "/administracao/usuarios", title: "Usuários e vínculos", text: "Papel por conselho. Convite continua no Auth." },
  { href: "/administracao/auditoria", title: "Auditoria", text: "Trilha append-only de ações e negativas." },
  { href: "/administracao/retencao", title: "Retenção documental", text: "Elegibilidade de limpeza, autorizações e bloqueios." },
];

async function Content() {
  const result = await loadScreen(async ({ actor }) => {
    if (!actor.isCentralAdmin) return fail("FORBIDDEN", "Administração restrita ao admin central.");
    return ok(true);
  });
  return (
    <Screen result={result}>
      {() => (
        <ul className="grid gap-4 md:grid-cols-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="surface-card block p-5 transition-shadow hover:shadow-[0_16px_40px_-24px_oklch(0.23_0.05_250_/_0.45)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <p className="font-heading text-lg font-medium tracking-tight text-primary">{l.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}

export default function AdministrationPage() {
  return (
    <>
      <PageHeader title="Administração" description="Funções restritas à administração central." />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
