type WordType = "Noun";
export interface DictionaryLookUp {
  MEANINGS: {
    [numberKey: string]: [WordType, string, string[], string[]];
  };
  ANTONYMS: string[];
  SYNONYMS: string[];
}

export interface DatabaseType {
  topics: Topic[];
  selectedTopicId?: string;
  rememberList: string[];
  dictionaryLookedUpList: string[];
}
export const defaultDatabaseType: DatabaseType = {
  topics: [],
  selectedTopicId: undefined,
  rememberList: [],
  dictionaryLookedUpList: [],
};

export interface Topic {
  id?: string;
  title: string;
  content: {
    id?: string;
    text: string;
  }[];
}
