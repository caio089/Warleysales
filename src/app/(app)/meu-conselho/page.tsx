import { redirect } from "next/navigation";

/** O painel do órgão ficou dentro da visão geral. Endereços antigos continuam abrindo a mesma tela. */
export default async function MeuConselhoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single) params.set(key, single);
  }
  const query = params.toString();
  redirect(query ? `/dashboard?${query}` : "/dashboard");
}
