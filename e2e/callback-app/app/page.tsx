"use client";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ProcessView, type ProcessViewProps } from "@/app/(app)/processos/[id]/process-view";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { FileUpload } from "@/shared/ui/file-upload";
import { DataTable } from "@/shared/ui/data-table";
import { MaterialOrdersSection } from "@/app/(app)/meu-conselho/material-orders-section";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const props: ProcessViewProps = {
  view: { process: { id: "e2e-process", councilId: "e2e-council", sequence: 42, year: 2026, number: "042/2026", title: "Aquisição de Insumos Odontológicos", status: "em_andamento", documentalCompletedAt: null, snapshot: null, closingReportRegistered: false, closingJustification: null, createdBy: "fixture", createdAt: new Date("2026-01-15T10:00:00Z") }, progress: { validTypes: ["DFD", "ETP", "MR"], missingTypes: ["TR", "PP", "PJ", "ED"], percent: 43, isComplete: false }, displayPercent: 43, completion: "pendente" },
  documents: [{ id: "doc-1", processId: "e2e-process", typeCode: "DFD", fileName: "dfd_anexo.pdf", storagePath: "fixture/dfd.pdf", size: 1024, sha256: "synthetic", uploadedBy: "fixture", linkStatus: "active", uploadStatus: "confirmed", retentionState: "retained" }], formalization: null, suppliers: [], canManage: false, canUnlink: false, canRegisterClosing: false, isWarley: false, defaultEstimatedValue: 50000, requestId: "fixture-request", requestItems: [{ materialId: "fixture-item", name: "Resina Fotopolimerizável", quantity: 100 }], linkedAtas: [], linkedContracts: []
};
const rows = [{ id: "1", name: "Resina", status: "Pendente" }, { id: "2", name: "Luvas", status: "Concluído" }];
const fixtureOrder = { id: "fixture-order", number: "PED-001", councilId: "fixture-council", status: "pendente" as const, requestedBy: "fixture-user", notes: "synthetic", items: [{ id: "fixture-line", orderId: "fixture-order", materialId: "resina", quantity: 4 }], createdAt: new Date("2026-01-01T12:00:00Z"), updatedAt: new Date("2026-01-01T12:00:00Z") };

export default function ComponentShowcase() {
  const path = usePathname();
  const [outcome, setOutcome] = useState("resolve-false");
  const rejectAttempt = useRef(0);
  const [callbackCount, setCallbackCount] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);
  if (path === "/confirm") return <main><label>Resultado <select aria-label="Resultado confirmação" value={outcome} onChange={e => { rejectAttempt.current = 0; setOutcome(e.target.value); }}><option value="resolve-false">Falha</option><option value="reject">Rejeição</option><option value="success">Sucesso</option></select></label><output aria-label="Chamadas do callback">{callbackCount}</output><ConfirmDialog title="Confirmar ação" description="Ação sintética" trigger={<button type="button">Abrir confirmação</button>} confirmLabel="Confirmar" onConfirm={async () => { await new Promise(resolve => setTimeout(resolve, 180)); setCallbackCount(count => count + 1); if (outcome === "reject" && rejectAttempt.current++ === 0) throw new Error("fixture"); return outcome === "success" || outcome === "reject"; }} /></main>;
  if (path === "/upload") return <main><FileUpload label="Selecionar arquivo" onUpload={async (_file, progress) => { progress(40); await new Promise(resolve => setTimeout(resolve, 450)); setUploadDone(true); return { ok: true, data: undefined }; }} /><output>{uploadDone ? "Upload concluído" : "Upload aguardando"}</output></main>;
  if (path === "/table") return <main><DataTable caption="Ordens de materiais" data={rows} columns={[{ key: "name", header: "Material", accessor: row => row.name, sortable: true, searchable: true }, { key: "status", header: "Status", accessor: row => row.status, searchable: true }]} getRowId={row => row.id} /><MaterialOrdersSection councilId="fixture-council" orders={[fixtureOrder]} availableStock={[]} materialLabelMap={{ resina: "Resina composta" }} canCreateOrder={false} /></main>;
  if (path === "/sheet") return <main><Sheet><SheetTrigger render={<button type="button">Abrir painel</button>} /><SheetContent><SheetHeader><SheetTitle>Painel fixture</SheetTitle><SheetDescription>Conteúdo sintético</SheetDescription></SheetHeader></SheetContent></Sheet></main>;
  return <main style={{ padding: 24 }}><h1>E2E ProcessView fixture</h1><ProcessView {...props} /></main>;
}
