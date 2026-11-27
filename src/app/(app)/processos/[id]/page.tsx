import { redirect } from "next/navigation";

export default async function LegacyProcessPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { id } = await params;
  const { aba } = await searchParams;
  const tab = aba && ["aprovacoes", "documentos", "contratacao", "governanca", "historico"].includes(aba)
    ? `?aba=${aba}`
    : "";
  redirect(`/solicitacoes/processos/${id}${tab}`);
}
