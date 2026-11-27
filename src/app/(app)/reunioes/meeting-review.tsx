"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";
import { meetingReviewAction } from "@/modules/meetings/review-actions";

export function MeetingReview({ id, canManage, realized, hasAudio, hasTranscript, hasMinutes, approved, draft, reviewed, suggestions, people, state, stage }: {
  id: string; canManage: boolean; realized: boolean; hasAudio: boolean; hasTranscript: boolean;
  hasMinutes: boolean; approved: boolean; draft?: string | null; reviewed: boolean;
  suggestions: string[]; people: {value:string;label:string}[]; state?: string | null; stage?: string | null;
}) {
  const router = useRouter();
  const pending = state === "queued" || state === "running";
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [pending, router]);
  return <section className="surface-card space-y-4 p-4" aria-label="Transcrição e aprovação da ata">
    <h3 className="text-lg font-semibold">Transcrição e aprovação da ata</h3>
    {state && <p role="status" className="text-sm">{stage === "transcript" ? "Transcrição" : "Geração de minuta"}: {
      pending ? state === "queued" ? "Na fila" : "Em processamento" : state === "failed" ? "Falhou. Confira a configuração ou tente novamente." : "Concluída"
    }</p>}
    {canManage && !pending && ((hasAudio && !hasTranscript) || (realized && hasTranscript && !hasMinutes && !draft)) &&
      <ActionForm action={meetingReviewAction} submitLabel={hasTranscript ? "Solicitar minuta com IA" : "Solicitar transcrição"}
        hiddenFields={{ meetingId: id, operation: hasTranscript ? "draft" : "transcript" }}>
        {() => <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" className="mt-1" /> Autorizo o envio do áudio ou da transcrição ao provedor externo Groq para esta operação.</label>}
      </ActionForm>}
    {realized && !hasMinutes && draft && <>
      <p className="font-medium">{reviewed ? "Minuta em revisão" : "Minuta gerada por IA"}</p>
      {!canManage && <p className="whitespace-pre-wrap break-words text-sm">{draft}</p>}
    </>}
    {canManage && realized && !hasMinutes && !pending && <>
      <ActionForm key={draft ?? "empty"} action={meetingReviewAction} submitLabel="Salvar revisão" resetOnSuccess={false}
        hiddenFields={{ meetingId: id, operation: "review" }}>
        {(errors) => <TextAreaField name="text" label="Texto da minuta" defaultValue={draft ?? ""} required errors={errors.text} />}
      </ActionForm>
      {reviewed && draft && <ActionForm action={meetingReviewAction} submitLabel="Aprovar versão revisada" hiddenFields={{ meetingId: id, operation: "approve", text: draft }}>
        {() => <p className="text-sm">A aprovação usa o texto da última revisão salva.</p>}
      </ActionForm>}
    </>}
    {hasMinutes && <p className="font-medium">{approved ? "Ata aprovada" : "Ata registrada manualmente"}</p>}
    {hasMinutes && <a className="inline-block underline" href={`/api/reunioes/ata?reuniao=${id}`}>Baixar ata em PDF</a>}
    {canManage && !hasMinutes && suggestions.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm">
      {suggestions.map((description) => <li key={description}>{description}</li>)}
    </ul>}
    {canManage && approved && <div className="space-y-2">
      <h4 className="font-semibold">Confirmar atividades</h4>
      {[...suggestions, ""].map((description) => <details key={description} className="rounded-lg border p-3">
        <summary className="cursor-pointer break-words">{description || "Registrar atividade da ata"}</summary>
        <ActionForm action={meetingReviewAction} submitLabel="Confirmar tarefa" hiddenFields={{ meetingId: id, operation: "task" }} resetOnSuccess={false}>
          {(errors) => <>
            <TextField name="description" label="Descrição" defaultValue={description} required errors={errors.description} />
            <SelectField name="responsibleId" label="Responsável" options={people} required errors={errors.responsibleId} />
            <TextField name="dueDate" label="Prazo" type="date" required errors={errors.dueDate} />
          </>}
        </ActionForm>
      </details>)}
    </div>}
  </section>;
}
