"use client";

import { addActionItemFormAction, meetingStepFormAction, saveMinutesFormAction, scheduleMeetingFormAction } from "@/modules/meetings/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function NewMeetingForm({
  councils,
  defaultCouncilId,
  lockCouncil = false,
}: {
  councils: Option[];
  defaultCouncilId?: string;
  /** Quando true, o conselho já está definido (painel do conselho) e não aparece no formulário. */
  lockCouncil?: boolean;
}) {
  return (
    <ActionForm
      action={scheduleMeetingFormAction}
      submitLabel="Agendar reunião"
      hiddenFields={lockCouncil && defaultCouncilId ? { councilId: defaultCouncilId } : undefined}
    >
      {(e) => (
        <>
          {!lockCouncil ? (
            <SelectField
              name="councilId"
              label="Conselho"
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
export function MeetingActions({ meetings, done, actionable }: { meetings: Option[]; done: Option[]; actionable: Option[] }) {
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
      {done.length > 0 ? (
        <section aria-labelledby="ata" className="surface-card p-6">
          <h2 id="ata" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Registrar ata da reunião</h2>
          <ActionForm action={saveMinutesFormAction} submitLabel="Salvar ata">
            {(e) => (<>
              <SelectField name="meetingId" label="Reunião realizada" required options={done} errors={e.meetingId} />
              <TextAreaField name="text" label="Conteúdo da ata" required errors={e.text} />
            </>)}
          </ActionForm>
        </section>
      ) : null}
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
