import { redirect } from "next/navigation";

export default async function OldNewAtaPage({ searchParams }: { searchParams: Promise<{ processId?: string }> }) {
  const { processId } = await searchParams;
  if (processId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(processId)) {
    redirect(`/solicitacoes/processos/${processId}?aba=contratacao`);
  }
  redirect("/processos");
}
