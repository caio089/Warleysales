"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { uploadToSignedUrl } from "@/shared/lib/browser-upload";
import { confirmMeetingAudioAction, meetingAudioUrlAction, prepareMeetingAudioAction } from "@/modules/meetings/media-actions";

interface MeetingOption {
  id: string;
  title: string;
  status: string;
  audioPath: string | null;
  transcript: string | null;
}

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg"];

export function MeetingMediaPanel({ meetings, manageableMeetingIds }: { meetings: MeetingOption[]; manageableMeetingIds: string[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(meetings[0]?.id ?? "");
  const selected = meetings.find((meeting) => meeting.id === selectedId) ?? meetings[0];
  const canManageSelected = Boolean(selected && manageableMeetingIds.includes(selected.id) && selected.status !== "cancelada");
  const [transcript, setTranscript] = useState(selected?.transcript ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [requestingMic, setRequestingMic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function choose(id: string) {
    if (recording) return;
    setSelectedId(id);
    setTranscript(meetings.find((meeting) => meeting.id === id)?.transcript ?? "");
    setFile(null);
    setSavedUrl(null);
    setPreviewUrl(null);
    setMessage("");
  }

  async function startRecording() {
    if (!selected || !canManageSelected || selected.audioPath || requestingMic || recording) return;
    setRequestingMic(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Gravação indisponível neste navegador.");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
        .find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const baseMime = blob.type.split(";")[0]!;
        const extension = baseMime === "audio/mp4" ? "m4a" : baseMime === "audio/ogg" ? "ogg" : "webm";
        setFile(new File([blob], `reuniao.${extension}`, { type: baseMime }));
        setPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
      setMessage("");

    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setMessage(error instanceof Error ? error.message : "Não foi possível acessar o microfone.");
    } finally {
      setRequestingMic(false);
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function saveAudio() {
    if (!selected || !file) return;
    const mime = file.type.split(";")[0]!;
    if (!AUDIO_TYPES.includes(mime) || file.size < 1 || file.size > MAX_AUDIO_BYTES) {
      setMessage("Escolha um áudio WebM, MP4, OGG ou MP3 de até 25 MB.");
      return;
    }
    setBusy(true);
    try {
      const prepared = await prepareMeetingAudioAction(selected.id, mime, file.size);
      if (!prepared.ok) throw new Error(prepared.message);
      const uploaded = await uploadToSignedUrl(prepared.data.path, prepared.data.token, file, mime, "meeting-audio");
      if (!uploaded.ok) throw new Error(uploaded.message);
      const confirmed = await confirmMeetingAudioAction(selected.id, prepared.data.path, transcript);
      if (!confirmed.ok) throw new Error(confirmed.message);
      setFile(null);
      setMessage("Áudio registrado.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao salvar o áudio.");
    } finally {
      setBusy(false);
    }
  }

  async function openSavedAudio() {
    if (!selected) return;
    const result = await meetingAudioUrlAction(selected.id);
    if (result.ok) setSavedUrl(result.data);
    else setMessage(result.message);
  }

  if (meetings.length === 0) return null;
  return (
    <section aria-labelledby="meeting-audio" className="surface-card space-y-4 p-6">
      <div>
        <h2 id="meeting-audio" className="font-heading text-lg font-medium text-primary">Áudio e transcrição da reunião</h2>
        <p className="text-sm text-muted-foreground">Grave pelo microfone ou envie um arquivo privado. Você pode incluir uma transcrição que já tenha.</p>
      </div>
      {meetings.length > 1 && <label className="block text-sm font-medium">Reunião
        <select value={selected?.id ?? ""} onChange={(event) => choose(event.target.value)} disabled={recording || busy} className="mt-1 block w-full rounded-lg border border-border bg-background p-2">
          {meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.title}</option>)}
        </select>
      </label>}
      {selected?.audioPath ? (
        <div className="space-y-3">
          <Button type="button" variant="outline" onClick={openSavedAudio}>Ouvir áudio salvo</Button>
          {savedUrl ? <audio controls src={savedUrl} className="w-full" aria-label={`Áudio de ${selected.title}`} /> : null}
          {selected.transcript ? <p className="text-sm text-muted-foreground">Transcrição registrada: {selected.transcript}</p> : null}
        </div>
      ) : canManageSelected ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={recording ? stopRecording : startRecording} disabled={busy || requestingMic}>{requestingMic ? "Aguardando microfone…" : recording ? "Parar gravação" : "Iniciar gravação"}</Button>
            <label className="rounded-lg border border-border px-3 py-2 text-sm">Ou anexar arquivo
              <input type="file" accept="audio/webm,audio/mp4,audio/ogg,audio/mpeg" disabled={recording || busy} onChange={(event) => {
                const chosen = event.target.files?.[0] ?? null;
                setFile(chosen);
                setPreviewUrl(chosen ? URL.createObjectURL(chosen) : null);
              }} className="ml-2 max-w-56 text-xs" />
            </label>
          </div>
          {previewUrl ? <audio controls src={previewUrl} className="w-full" aria-label="Prévia do áudio" /> : null}
          <label className="block text-sm font-medium">Transcrição para conferência
            <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} maxLength={20000} rows={5} className="mt-1 block w-full rounded-lg border border-border bg-background p-3 text-sm" />
          </label>
          <Button type="button" onClick={saveAudio} disabled={!file || busy || recording}>{busy ? "Salvando…" : "Salvar áudio"}</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">Nenhum áudio registrado.</p>}
      {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
    </section>
  );
}
