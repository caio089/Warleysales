import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/modules/processes/actions", () => ({ changeProcessStatusFormAction: vi.fn() }));

import { ArchiveProcessAction } from "./archive-process-action";

describe("ArchiveProcessAction", () => {
  it("oferece uma ação direta para arquivar e leva ao módulo de consulta", () => {
    const active = renderToStaticMarkup(<ArchiveProcessAction processId="proc-1" status="concluido" canArchive />);
    expect(active).toContain("Arquivar licitação");
    expect(active).toContain('name="status" value="arquivado"');
    expect(renderToStaticMarkup(<ArchiveProcessAction processId="proc-1" status="em_andamento" canArchive />)).toContain("conclua ou cancele primeiro");

    const archived = renderToStaticMarkup(<ArchiveProcessAction processId="proc-1" status="arquivado" canArchive />);
    expect(archived).toContain("Licitação arquivada");
    expect(archived).toContain('href="/processos/arquivados"');
    expect(archived).not.toContain('name="status"');
  });
});
