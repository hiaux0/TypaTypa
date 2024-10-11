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
export interface Cell {
  text: string;
  colOfNextText?: number;
  scrollWidth?: number;
}
export type ContentMap = Cell[][];
export interface Sheet {
  id: string;
  title: string;
  content: ContentMap;
  selectedRange?: GridSelectionRange;
}

export interface GridDatabaseType {
  version: string;
  sheets: Sheet[];
  selectedSheetId?: string;
}

//export const defaultGridDatabaseType: GridDatabaseType = {
//  sheets: [{ id: "1", title: "Sheet 1", content: [] }],
//  selectedSheetId: "1",
//};
export const defaultGridDatabaseType: GridDatabaseType = {
  version: "0.0.2",
  sheets: [
    {
      id: "1",
      title: "Sheet 1",
      content: [
        [{ text: "00" }, { text: "10" }, { text: "20" }],
        [{ text: "01" }],
      ],
      selectedRange: [
        [0, 0],
        [0, 0],
      ],
    },
  ],
  selectedSheetId: "1",
};
