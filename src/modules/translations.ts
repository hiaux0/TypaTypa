export const translations = {
  introduction: "Introduction",
  List: "List",
  ["topic.list"]: "Topic List",
  search: "Search",
  ["search.propaganda"]: "Search Propaganda",
  ["search.tags"]: "Search Tags",
  ["search.topics"]: "Search Topics",
  untitled: "Untitled",
} as const;

export function getTranslationMap(language: "en" | "vn"): typeof translations {
  switch (language) {
    case "vn": {
      return translations;
    }
    default: {
      return translations;
    }
  }
}

export function getTranslation(key: keyof typeof translations): string {
  const found = translations[key];
  return found ?? `?${key}?`;
}
