import { LANGUAGES } from "../constants";

export const AI_SYSTEM = {
  translator:
    "You are a translator. Your role is to translate words or sentences into the specified target language.",
};

export const AI_PROMPTS = {
  translate: (word: string, language: keyof typeof LANGUAGES = "vi") =>
    `Translate the word '${word}' into ${LANGUAGES[language]}. Please just provide the translation itself, no further description`,
};
