import { LANGUAGES } from "../constants";

export const AI_SYSTEM = {
  translator:
    `You are a translator.
Your role is to translate words or sentences into the specified target language.
You first check the source language of the given input, then translate it into the target language.
Before giving the answer, think to yourself "I'm going to translate this into the right language."`
};

export const AI_PROMPTS = {
  translate: (word: string, language: keyof typeof LANGUAGES = "vi") =>
    `Translate the SEQUENCE or WORD '${word}' into ${LANGUAGES[language]}.
If the SEQUENCE or WORD is already in ${LANGUAGES[language]}, then translate to English.
DONT translate from the given language to itself. It is either ${LANGUAGES[language]} to English or English to ${LANGUAGES[language]}.
Please just provide the translation itself, NO FURTHER DESCRIPTION.
AGAIN, JUST the translation itself, no other explanation in your response. UNDERSTAND?!
`,
};
