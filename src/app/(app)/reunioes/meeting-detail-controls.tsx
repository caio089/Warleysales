"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadUrlAction } from "@/modules/documents/actions";
import { addActionItemFormAction, meetingStepFormAction, saveMinutesFormAction, updateMeetingDetailsFormAction } from "@/modules/meetings/actions";
import { meetingAudioUrlAction } from "@/modules/meetings/media-actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function MeetingDetailsEditor({ id, title, agenda, decisions, responsibleId, participantIds, attachmentIds, people, attachments }: {
  id: string; title: string; agenda: string; decisions: string; responsibleId: string;
  participantIds: string[]; attachmentIds: string[]; people: Option[]; attachments: Option[];
}) {
  const checkboxes = (name: string, legend: string, options: Option[], saved: string[]) => (
    <fieldset className="min-w-0 space-y-2">
      <legend className="font-medium">{legend}</legend>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
        {options.map((option) => <label key={option.value} className="flex items-center gap-2 rounded p-1 text-sm">
          <input type="checkbox" name={name} value={option.value} defaultChecked={saved.includes(option.value)} />
          <span className="min-w-0 break-words">{option.label}</span>
        </label>)}
        {!options.length && <p className="px-1 text-sm text-muted-foreground">Nenhum registro disponível.</p>}
      </div>
      {saved.filter((value) => !options.some((option) => option.value === value))
        .map((value) => <input key={value} type="hidden" name={name} value={value} />)}
    </fieldset>
  );

  return <details className="surface-card p-4 sm:p-5">
    <summary className="cursor-pointer rounded font-semibold focus-visible:outline-2 focus-visible:outline-ring">Editar dados da reunião</summary>
    <div className="pt-4">
      <ActionForm action={updateMeetingDetailsFormAction} hiddenFields={{ meetingId: id }} submitLabel="Salvar dados da reunião" resetOnSuccess={false}>
        {(errors) => <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField name="title" label="Título" required defaultValue={title} errors={errors.title} />
            <SelectField name="responsibleId" label="Responsável pela reunião" optional placeholder="Sem responsável definido"
              options={people} defaultValue={responsibleId} errors={errors.responsibleId} />
            <TextAreaField name="agenda" label="Pauta" defaultValue={agenda} errors={errors.agenda} />
            <TextAreaField name="decisions" label="Decisões tomadas" defaultValue={decisions} errors={errors.decisions} />
            {checkboxes("participantIds", "Participantes relacionados", people, participantIds)}
            {checkboxes("attachmentIds", "Anexos de processos do órgão", attachments, attachmentIds)}
          </div>
        </>}
      </ActionForm>
    </div>
  </details>;
}

export function MeetingStatusEditor({ id }: { id: string }) {
  const [step, setStep] = useState("");
  return <details className="surface-card p-4">
    <summary className="cursor-pointer rounded font-semibold focus-visible:outline-2 focus-visible:outline-ring">Atualizar situação ou reagendar</summary>
    <div className="pt-3">
      <ActionForm action={meetingStepFormAction} hiddenFields={{ meetingId: id }} submitLabel="Atualizar reunião"
        onSuccess={() => setStep("")}>
        {(errors) => <>
          <SelectField name="to" label="Nova situação" options={[{ value: "realizada", label: "Realizada" },
            { value: "cancelada", label: "Cancelada" }, { value: "reagendada", label: "Reagendar" }]}
            required errors={errors.to} onChange={setStep} />
          {step === "reagendada" && <TextField name="newScheduledAt" label="Nova data e hora (Fortaleza)"
            type="datetime-local" required errors={errors.newScheduledAt} />}
        </>}
      </ActionForm>
    </div>
  </details>;
}

export function MeetingTaskEditor({ id, people }: { id: string; people: Option[] }) {
  return <ActionForm action={addActionItemFormAction} hiddenFields={{ meetingId: id }} submitLabel="Registrar atividade">
    {(errors) => <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><TextField name="description" label="Descrição da atividade" required errors={errors.description} /></div>
      <SelectField name="responsibleId" label="Responsável pela atividade" options={people} optional placeholder="Sem responsável definido" errors={errors.responsibleId} />
      <TextField name="dueDate" label="Prazo" type="date" errors={errors.dueDate} />
    </div>}
  </ActionForm>;
}

export function MeetingMinutesEditor({ id, text }: { id: string; text?: string }) {
  return <details className="rounded-lg border p-3">
    <summary className="cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-ring">{text ? "Editar ata" : "Registrar ata manualmente"}</summary>
    <div className="pt-3">
      <ActionForm action={saveMinutesFormAction} hiddenFields={{ meetingId: id }} submitLabel="Salvar ata" resetOnSuccess={false}>
        {(errors) => <TextAreaField name="text" label="Texto da ata" defaultValue={text} required errors={errors.text} />}
      </ActionForm>
    </div>
  </details>;
}

export function MeetingFile({ attachmentId, meetingId }: { attachmentId?: string; meetingId?: string }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  async function getUrl() {
    setBusy(true);
    setError("");
    try {
      const result = attachmentId ? await downloadUrlAction(attachmentId) : await meetingAudioUrlAction(meetingId!);
      if (result.ok) setUrl(result.data);
      else setError(result.message);
    } catch {
      setError("Não foi possível abrir o arquivo.");
    } finally {
      setBusy(false);
    }
  }
  return <div className="space-y-1">
    {!url && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={getUrl}>
      {busy ? "Carregando…" : attachmentId ? "Carregar anexo" : "Carregar gravação"}
    </Button>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {url && (attachmentId ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block rounded text-sm underline focus-visible:outline-2 focus-visible:outline-ring">Abrir anexo em nova aba</a>
      : <audio className="w-full max-w-sm" src={url} controls aria-label="Gravação da reunião" />)}
  </div>;
}
