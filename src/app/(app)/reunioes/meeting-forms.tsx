"use client";

import { meetingEvidenceFormAction, scheduleMeetingFormAction } from "@/modules/meetings/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function NewMeetingForm({
  councils,
  defaultCouncilId,
  lockCouncil = false,
  openDetails = false,
  onSuccess,
}: {
  councils: Option[];
  defaultCouncilId?: string;
  /** Quando true, o órgão já está definido (painel do órgão) e não aparece no formulário. */
  lockCouncil?: boolean;
  openDetails?: boolean;
  onSuccess?: () => void;
}) {
  return (
    <ActionForm
      action={scheduleMeetingFormAction}
      submitLabel="Agendar reunião"
      hiddenFields={{
        ...(lockCouncil && defaultCouncilId ? { councilId: defaultCouncilId } : {}),
        ...(openDetails ? { openDetails: "1" } : {}),
      }}
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
