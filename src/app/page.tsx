import { redirect } from "next/navigation";

/** A raiz leva ao painel; a proteção por sessão ocorre no layout autenticado. */
export default function Home() {
  redirect("/dashboard");
}
