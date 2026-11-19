import { AppShell } from "@/shared/ui/app-shell/app-shell";

export default function NavigationFixture() {
  return <AppShell navHrefs={["/dashboard", "/estoque", "/entregas", "/alertas"]}><h1>Navigation fixture</h1></AppShell>;
}
