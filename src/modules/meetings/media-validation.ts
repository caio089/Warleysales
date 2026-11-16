export const MAX_MEETING_AUDIO_BYTES = 25 * 1024 * 1024;

export const MEETING_AUDIO_EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/mpeg": "mp3",
};

export function validMeetingAudio(mime: string, size: number): boolean {
  return Object.hasOwn(MEETING_AUDIO_EXTENSIONS, mime)
    && Number.isSafeInteger(size) && size > 0 && size <= MAX_MEETING_AUDIO_BYTES;
}

export function meetingOwnsAudioPath(path: string, councilId: string, meetingId: string): boolean {
  return path.startsWith(`${councilId}/${meetingId}/`)
    && /^[a-f0-9-]{36}\.(webm|m4a|ogg|mp3)$/.test(path.slice(`${councilId}/${meetingId}/`.length));
}
