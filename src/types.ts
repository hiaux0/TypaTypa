import { Id } from "./domain/types/types";

declare global {
  interface Window {
    activeVimInstancesIdMap: Id[];
  }
}

export type Direction = "up" | "down" | "left" | "right" | "none";
export interface DirectionMap {
  x: Direction;
  y: Direction;
}

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
export type GridSelectionRange = [
  start: GridSelectionCoord,
  end: GridSelectionCoord,
];
export const defaultGridSelectionRange: GridSelectionRange = [
  [0, 0],
  [0, 0],
];

// export type ContentMap = Record<string, string>;
export interface Cell {
  text: string;
  col?: number;
  row?: number;
  colsToNextText?: number;
}
export type ContentMap = Cell[][];
export type ColHeaderMap = Record<
  string,
  {
    colWidth: number;
  }
>;
export type RowHeaderMap = Record<
  string,
  {
    height: number;
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
  /* TODO: rename to columnSettingsMap */
  colHeaderMap?: ColHeaderMap;
  rowHeaderMap?: RowHeaderMap;
  settings?: SheetSettings;
}

export interface GridDatabaseType {
  version: string;
  sheets: Sheet[];
  selectedSheetId?: string;
}

export const defaultGridDatabaseType: GridDatabaseType = {
  version: "",
  sheets: [{ id: "1", title: "Sheet 1", content: [] }],
  selectedSheetId: "1",
};
// export const defaultGridDatabaseType: GridDatabaseType = {};
