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
      content: [["00", "10", "20"], ["01"]],
      selectedRange: [
        [0, 0],
        [0, 0],
      ],
    },
    {
      id: "gezk7yo-b84jfg8dl1",
      title: "Vn-dict",
      content: [
        [
          "khẽ\nhớn hở\nlộ vẻ\nxẹt\nthình lình\nchừng nào\nbàng hoàng\nngẩn ngơ\n",
        ],
      ],
      selectedRange: [
        [6, 3],
        [6, 3],
      ],
    },
  ],
  selectedSheetId: "1",
};
