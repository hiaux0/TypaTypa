export const translations = {
  untitled: "Untitled",
};

export function getTranslation(key: keyof typeof translations): string {
  return translations[key];
}
