export type Direction = "up" | "down" | "left" | "right" | "none";

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

export interface LabeledWordsData {
  word: string;
  disabled: boolean;
}

export interface Topic {
  id?: string;
  title: string;
  content: {
    id?: string;
    text: string;
  }[];
}
export interface TypingDatabaseType {
  topics: Topic[];
  selectedTopicId?: string;
  rememberList: string[];
  dictionaryLookedUpList: string[];
}

export interface Features {
  remember: Set<string>;
  topics: {
    id: string;
    title: string;
  }[];
}

export type GridSelectionCoord = [number, number];
export type GridSelectionRange = [GridSelectionCoord, GridSelectionCoord];

// export type ContentMap = Record<string, string>;
export type ContentMap = string[][];
export interface Sheet {
  id: string;
  title: string;
  content: ContentMap;
  selectedRange?: GridSelectionRange;
}

export interface GridDatabaseType {
  sheets: Sheet[];
  selectedSheetId?: string;
}

//export const defaultGridDatabaseType: GridDatabaseType = {
//  sheets: [{ id: "1", title: "Sheet 1", content: [] }],
//  selectedSheetId: "1",
//};
export const defaultGridDatabaseType: GridDatabaseType = {
  sheets: [
    {
      id: "1",
      title: "Sheet 1",
      content: [["okay"], ["0", "1", "2", "3", "4"], ["okayo"], ["hello"]],
      selectedRange: [
        [2, 1],
        [2, 1],
      ],
    },
  ],
  selectedSheetId: "1",
};
