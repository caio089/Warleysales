"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { draftMeetingMinutesAction } from "@/modules/meetings/media-actions";
import { meetingEvidenceFormAction, addActionItemFormAction, meetingStepFormAction, saveMinutesFormAction, scheduleMeetingFormAction } from "@/modules/meetings/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };
type DoneOption = Option & { transcript: string | null; minutesText: string | null };

export function NewMeetingForm({
  councils,
  defaultCouncilId,
  lockCouncil = false,
  onSuccess,
}: {
  councils: Option[];
  defaultCouncilId?: string;
  /** Quando true, o órgão já está definido (painel do órgão) e não aparece no formulário. */
  lockCouncil?: boolean;
  onSuccess?: () => void;
}) {
  return (
    <ActionForm
      action={scheduleMeetingFormAction}
      submitLabel="Agendar reunião"
      hiddenFields={lockCouncil && defaultCouncilId ? { councilId: defaultCouncilId } : undefined}
      onSuccess={onSuccess}
    >
      {(e) => (
        <>
          {!lockCouncil ? (
            <SelectField
              name="councilId"
              label="Órgão"
              required
              options={councils}
              defaultValue={defaultCouncilId}
              errors={e.councilId}
            />
          ) : null}
          <TextField name="title" label="Título" required errors={e.title} />
          <TextField
            name="scheduledAt"
            label="Data e hora (horário de Fortaleza)"
            type="datetime-local"
            required
            errors={e.scheduledAt}
          />
        </>
      )}
    </ActionForm>
  );
}

/** Mudança de status, ata da reunião e pendências. */
function MinutesEditor({ done }: { done: DoneOption[] }) {
  const [meetingId, setMeetingId] = useState(done[0]?.value ?? "");
  const [draft, setDraft] = useState(done[0]?.minutesText ?? done[0]?.transcript ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function makeDraft() {
    const selected = done.find((meeting) => meeting.value === meetingId);
    if (!selected?.transcript) {
      setMessage("Registre primeiro a transcrição da reunião.");
      return;
    }
    setBusy(true);
    const result = await draftMeetingMinutesAction(meetingId);
    if (result.ok) {
      setDraft(result.data);
      setMessage("Proposta gerada. Revise o texto antes de salvar.");
    } else setMessage(result.message);
    setBusy(false);
  }
  return (
    <section aria-labelledby="ata" className="surface-card p-6">
      <h2 id="ata" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Registrar ata da reunião</h2>
      <ActionForm action={saveMinutesFormAction} submitLabel="Salvar ata revisada" resetOnSuccess={false}>
        {(e) => (<>
          <SelectField name="meetingId" label="Reunião realizada" required options={done} defaultValue={meetingId} onChange={(id) => {
            setMeetingId(id);
            const selected = done.find((meeting) => meeting.value === id);
            setDraft(selected?.minutesText ?? selected?.transcript ?? "");
            setMessage("");
          }} errors={e.meetingId} />
          <Button type="button" variant="outline" onClick={makeDraft} disabled={busy}>{busy ? "Gerando…" : "Gerar proposta com IA"}</Button>
          <p className="text-xs text-muted-foreground">Ao gerar a proposta, a transcrição é enviada ao provedor de IA. Revise o resultado antes de salvar.</p>
          <TextAreaField key={`${meetingId}:${draft}`} name="text" label="Revise a proposta antes de salvar" required defaultValue={draft} errors={e.text} />
        </>)}
      </ActionForm>
      {message ? <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </section>
  );
}

export function MeetingActions({ meetings, done, actionable }: { meetings: Option[]; done: DoneOption[]; actionable: Option[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {meetings.length > 0 ? (
        <section aria-labelledby="status" className="surface-card p-6">
          <h2 id="status" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Atualizar reunião agendada</h2>
          <ActionForm action={meetingStepFormAction} submitLabel="Aplicar">
            {(e) => (<>
              <SelectField name="meetingId" label="Reunião" required options={meetings} errors={e.meetingId} />
              <SelectField name="to" label="Novo status" required options={[{ value: "realizada", label: "Realizada" }, { value: "cancelada", label: "Cancelada" }, { value: "reagendada", label: "Reagendar" }]} errors={e.to} />
              <TextField name="newScheduledAt" label="Nova data (apenas ao reagendar)" type="datetime-local" errors={e.newScheduledAt} />
            </>)}
          </ActionForm>
        </section>
      ) : null}
      {done.length > 0 ? <MinutesEditor done={done} /> : null}
      {actionable.length > 0 ? (
        <section aria-labelledby="pendencia" className="surface-card p-6 lg:col-span-2">
          <h2 id="pendencia" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Pendência da reunião</h2>
          <ActionForm action={addActionItemFormAction} submitLabel="Registrar pendência">
            {(e) => (<>
              <SelectField name="meetingId" label="Reunião" required options={actionable} errors={e.meetingId} />
              <TextField name="description" label="Descrição" required errors={e.description} />
              <TextField name="dueDate" label="Prazo (opcional)" type="date" errors={e.dueDate} />
            </>)}
          </ActionForm>
        </section>
      ) : null}
    </div>
  );
}

export function MeetingEvidenceForm({ meetingId, kind, options }: {
  meetingId: string;
  kind: "attendance" | "completion";
  options: Option[];
}) {
  if (!options.length) return null;
  const attendance = kind === "attendance";
  return <ActionForm action={meetingEvidenceFormAction} submitLabel={attendance ? "Confirmar presença" : "Concluir tarefa"}>
    {(errors) => <>
      <input type="hidden" name="meetingId" value={meetingId} />
      <input type="hidden" name="kind" value={kind} />
      <SelectField name="targetId" label={attendance ? "Participante presente" : "Tarefa pendente"} options={options} required errors={errors.targetId} />
    </>}
  </ActionForm>;
}
