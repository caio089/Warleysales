import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";

/** A sessão usa cookies e só pode ser lida dentro de Suspense (Cache Components). */
async function RedirectHome() {
  const session = await getSession();
  if (session.status === "authenticated" && !session.actor.isCentralAdmin && session.actor.memberships.length > 0) {
    redirect("/meu-conselho");
  }
  redirect("/dashboard");
  return null;
}

/** Raiz: membros de conselho vão para o painel do conselho; admin central para a visão geral. */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <RedirectHome />
    </Suspense>
  );
}
