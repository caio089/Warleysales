"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { correctRequestAction } from "@/modules/purchases/correction-action";

interface Item { materialId?: string; description: string; quantity: number; unit: string }

export function CorrectionForm({ requestId, revision, title, councilId, councils, estimatedValue, priority, items }: {
  requestId: string; revision: string; title: string; councilId: string;
  councils: { id: string; label: string }[]; estimatedValue: number | null; priority: string; items: Item[];
}) {
  const [rows, setRows] = useState(items.map((item, index) => ({ ...item, key: String(index) })));
  return <details className="surface-card p-5">
    <summary className="cursor-pointer font-medium">Corrigir solicitação</summary>
    <p className="my-3 text-sm text-muted-foreground">Alterações de órgão, materiais ou quantidades retornam para análise e ajustam o estoque bloqueado. Após formalização, recebimento ou compromisso de ata, esses campos ficam protegidos. Toda correção exige justificativa.</p>
    <ActionForm action={correctRequestAction} submitLabel="Salvar correção" resetOnSuccess={false} hiddenFields={{ requestId, revision }}>
      {() => <div className="space-y-4">
        <label className="block text-sm">Objeto<Input name="title" required minLength={3} maxLength={200} defaultValue={title} /></label>
        <label className="block text-sm">Órgão<select className="block w-full rounded border p-2" name="councilId" defaultValue={councilId} required>{councils.map((council) => <option key={council.id} value={council.id}>{council.label}</option>)}</select></label>
        <label className="block text-sm">Valor estimado<Input name="estimatedValue" type="number" min="0" step="0.01" defaultValue={estimatedValue ?? ""} /></label>
        <label className="block text-sm">Prioridade<select className="block w-full rounded border p-2" name="priority" defaultValue={["Alta", "Média", "Baixa"].includes(priority) ? priority : "Média"} required>
          {["Alta", "Média", "Baixa"].map((level) => <option key={level}>{level}</option>)}
        </select></label>
        {rows.map((item) => <fieldset key={item.key} className="grid gap-3 rounded border p-3 sm:grid-cols-3">
          <input type="hidden" name="materialId" value={item.materialId ?? ""} />
          <label className="text-sm">Material<Input name="description" required minLength={2} maxLength={160} defaultValue={item.description} /></label>
          <label className="text-sm">Quantidade<Input name="quantity" type="number" min="0.001" step="0.001" required defaultValue={item.quantity} /></label>
          <label className="text-sm">Unidade<Input name="unit" required maxLength={20} defaultValue={item.unit} /></label>
          <Button type="button" variant="outline" disabled={rows.length === 1} onClick={() => setRows((current) => current.filter((row) => row.key !== item.key))}>Remover item</Button>
        </fieldset>)}
        <Button type="button" variant="outline" onClick={() => setRows((current) => [...current, { key: crypto.randomUUID(), description: "", quantity: 1, unit: "un" }])}>Adicionar item</Button>
        <label className="block text-sm">Justificativa<textarea name="justification" required minLength={10} maxLength={1000} className="block w-full rounded border p-2" /></label>
      </div>}
    </ActionForm>
  </details>;
}
