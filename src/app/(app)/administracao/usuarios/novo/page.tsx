import { redirect } from "next/navigation";

export default function NewUserPage() {
  redirect("/administracao/usuarios#vincular-usuario");
}
