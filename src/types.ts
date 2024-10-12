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
  col?: number;
  row?: number;
  colsToNextText?: number;
  scrollWidth?: number;
}
export type ContentMap = Cell[][];
export type ColHeaderMap = Record<
  string,
  {
    colWidth: number;
  }
>;
export interface SheetSettings {
  autosave?: boolean;
}
export interface Sheet {
  id: string;
  title: string;
  content: ContentMap;
  selectedRange?: GridSelectionRange;
  colHeaderMap?: ColHeaderMap;
  settings?: SheetSettings;
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
  version: "v0.0.2",
  sheets: [
    {
      id: "1",
      title: "Sheet 1",
      content: [
        [
          {
            text: "00",
          },
          {
            text: "10",
          },
          {
            text: "20",
          },
        ],
        [
          {
            text: "01",
          },
        ],
      ],
      selectedRange: [
        [1, 0],
        [1, 0],
      ],
    },
    {
      id: "gezk7yo-b84jfg8dl1",
      title: "Vn-dict",
      content: [
        [
          {
            text: "mục",
            scrollWidth: 118,
            col: 0,
            row: 0,
            colsToNextText: 2,
          },
          {
            text: "",
            col: 1,
            row: 0,
          },
          {
            text: "head; section / item / column",
            col: 2,
            row: 0,
            colsToNextText: 3,
            scrollWidth: 283,
          },
          {
            text: "",
            col: 3,
            row: 0,
          },
          {
            text: "mục",
            col: 4,
            row: 0,
            colsToNextText: 1,
            scrollWidth: 55,
          },
          {
            text: "nghiệp chướng",
            scrollWidth: 127,
            col: 5,
            row: 0,
            colsToNextText: null,
          },
        ],
        [
          {
            text: "linh cảm",
            scrollWidth: 78,
            col: 0,
            row: 1,
          },
          {
            text: "",
            col: 1,
            row: 1,
            scrollWidth: 0,
          },
          {
            text: "hunch; feeling; premonition",
            col: 2,
            row: 1,
            scrollWidth: 263,
          },
          {
            text: null,
            scrollWidth: 0,
            col: 3,
            row: 1,
          },
          {
            text: null,
            scrollWidth: 0,
            col: 4,
            row: 1,
          },
          {
            text: null,
            scrollWidth: 0,
            col: 5,
            row: 1,
          },
          {
            text: "ngây",
            col: 6,
            row: 1,
            scrollWidth: 39,
          },
        ],
        [
          {
            text: "chật vật",
            scrollWidth: 78,
            col: 0,
            row: 2,
          },
          {
            text: "",
            col: 1,
            row: 2,
            scrollWidth: 0,
          },
          {
            text: "tough; strenuous; requiring a lot of exertion / hard; difficult",
            col: 2,
            row: 2,
            scrollWidth: 614,
          },
          {
            text: "",
            col: 3,
            row: 2,
            scrollWidth: 0,
          },
          {
            text: null,
            scrollWidth: 0,
            col: 4,
            row: 2,
          },
          {
            text: null,
            scrollWidth: 0,
            col: 5,
            row: 2,
          },
          {
            text: "phổ biến",
            scrollWidth: 78,
            col: 6,
            row: 2,
          },
        ],
        [null],
        [],
      ],
      selectedRange: [
        [3, 0],
        [3, 0],
      ],
      colHeaderMap: {
        "0": {
          colWidth: 64,
        },
        "1": {
          colWidth: 64,
        },
        "2": {
          colWidth: 64,
        },
        "3": {
          colWidth: 64,
        },
        "4": {
          colWidth: 64,
        },
        "5": {
          colWidth: 64,
        },
        "6": {
          colWidth: 64,
        },
      },
    },
  ],
  selectedSheetId: "gezk7yo-b84jfg8dl1",
};
