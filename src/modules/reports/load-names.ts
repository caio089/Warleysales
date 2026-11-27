import type { Services } from "@/server/container";
import type { Actor } from "@/shared/lib/authz/policy";
import type { ReportNames } from "./presentation";

export async function loadReportNames(services: Services, actor: Actor): Promise<ReportNames> {
  const [councils, suppliers, materials, people, atas] = await Promise.all([
    services.councils.list(actor), services.suppliers.list(actor), services.inventory.listMaterials(actor), services.memberships.reportDirectory(actor), services.atas.list(actor),
  ]);
  return {
    councils: councils.ok ? councils.data.map((item) => ({ id: item.id, label: item.acronym || item.name })) : [],
    suppliers: suppliers.ok ? suppliers.data.map((item) => ({ id: item.id, label: item.name })) : [],
    materials: materials.ok ? materials.data.map((item) => ({ id: item.id, label: item.name })) : [],
    people: people.ok ? people.data.map((item) => ({ id: item.id, label: item.fullName || "Pessoa não identificada" })) : [],
    atas: atas.ok ? atas.data.map((item) => ({ id: item.ata.id, label: item.ata.number })) : [],
  };
}
