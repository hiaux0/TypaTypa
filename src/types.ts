export type WordType = "Noun";
export type OtherSynonyms = string[];
export type ExamplePhrases = string[];
export type WordMeaning = [WordType, string, OtherSynonyms, ExamplePhrases];
export interface DictionaryLookUp {
  MEANINGS: {
    [numberKey: string]: WordMeaning;
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
