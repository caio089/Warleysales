import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";

/** A sessão usa cookies e só pode ser lida dentro de Suspense (Cache Components). */
async function RedirectHome() {
  await getSession();
  redirect("/dashboard");
  return null;
}

/** Raiz: todo mundo entra na visão geral, que também reúne as ações do órgão. */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <RedirectHome />
    </Suspense>
  );
}
