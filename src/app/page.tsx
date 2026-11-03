import { redirect } from "next/navigation";
import { getSession } from "@/server/session";

/** Raiz: membros de conselho vão para o painel do conselho; admin central para a visão geral. */
export default async function Home() {
  const session = await getSession();
  if (session.status === "authenticated" && !session.actor.isCentralAdmin && session.actor.memberships.length > 0) {
    redirect("/meu-conselho");
  }
  redirect("/dashboard");
}
