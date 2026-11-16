import { describe, expect, it } from "vitest";
import { meetingOwnsAudioPath, validMeetingAudio } from "./media-validation";

describe("validação de áudio de reunião", () => {
  it("limita formato e tamanho do arquivo", () => {
    expect(validMeetingAudio("audio/webm", 1024)).toBe(true);
    expect(validMeetingAudio("audio/mpeg", 25 * 1024 * 1024)).toBe(true);
    expect(validMeetingAudio("application/pdf", 1024)).toBe(false);
    expect(validMeetingAudio("audio/webm", 25 * 1024 * 1024 + 1)).toBe(false);
    expect(validMeetingAudio("audio/webm", 0)).toBe(false);
  });

  it("só aceita arquivo gerado no diretório da própria reunião", () => {
    const council = "11111111-1111-4111-8111-111111111111";
    const meeting = "22222222-2222-4222-8222-222222222222";
    const file = "33333333-3333-4333-8333-333333333333.webm";
    expect(meetingOwnsAudioPath(`${council}/${meeting}/${file}`, council, meeting)).toBe(true);
    expect(meetingOwnsAudioPath(`outro/${meeting}/${file}`, council, meeting)).toBe(false);
    expect(meetingOwnsAudioPath(`${council}/${meeting}/../../${file}`, council, meeting)).toBe(false);
  });
});
