import "server-only";
import { ok, type Result } from "@/shared/lib/result";
import type { ScreenContext } from "./screen";

/** Mapas id → rótulo usados pelas telas (nunca confiam em dados do cliente). */
export interface Lookups {
  councils: { id: string; label: string }[];
  councilLabel: Record<string, string>;
  materials: { id: string; label: string }[];
  materialLabel: Record<string, string>;
}

export async function loadLookups({ services, actor }: ScreenContext): Promise<Result<Lookups>> {
  const councils = await services.councils.list(actor);
  if (!councils.ok) return councils;
  const materials = await services.inventory.listMaterials(actor);
  const materialRows = materials.ok ? materials.data : [];
  const councilRows = councils.data.map((c) => ({ id: c.id, label: c.acronym }));
  return ok({
    councils: councilRows,
    councilLabel: Object.fromEntries(councilRows.map((c) => [c.id, c.label])),
    materials: materialRows.map((m) => ({ id: m.id, label: `${m.code} — ${m.name}` })),
    materialLabel: Object.fromEntries(materialRows.map((m) => [m.id, `${m.code} — ${m.name}`])),
  });
}
