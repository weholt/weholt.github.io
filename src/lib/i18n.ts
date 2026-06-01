import type { LocalizedByVoice, LocalizedString, VoiceId } from "../schemas/content";

export function pickLocalized(value: LocalizedString, lang: "en" | "no" = "en"): string {
  return value[lang] || value.en;
}

export function pickVoice(value: LocalizedByVoice, voice: VoiceId = "professional"): LocalizedString {
  return value[voice] || value.professional || value.personal || value.playful || value.experimental || { en: "", no: "" };
}
