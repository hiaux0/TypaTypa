import { VIM_ID_MAP } from "./common/modules/constants";
import { Id } from "./domain/types/types";
import { KeyBindingModes, VimOptions } from "./features/vim/vim-types";
import { VimCore } from "./features/vim/vimCore/VimCore";

declare global {
  interface Window {
    activeVimInstancesIdMap: Id[];
    measureTextWidth: (text: string, font: string) => number;
  }
}

export type RequiredPick<T, Keys extends keyof T> = Required<Pick<T, Keys>> &
  Omit<T, Keys>;

export interface AutocompleteSource<T extends Record<string, any>> {
  text: string;
  top?: string;
  left?: string;
  right?: string;
  bottomRight?: string;
  bottomLeft?: string;
  data?: T;
}

export interface Tabs {
  title: string;
  shortcut: string;
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

export interface CellStyles {
  color?: string;
}

export interface IKeyData {
  key: string;
  modifiers: string[];
  composite: string;
}

// export type ContentMap = Record<string, string>;
export interface Cell {
  text: string;
  col?: number;
  row?: number;
  colsToNextText?: number;
  styles?: CellStyles;
}
export type ContentMap = Cell[][];
export type ColHeaderMapData = {
  colWidth: number;
};
export type ColHeaderMap = Record<string, ColHeaderMapData>;
export type RowHeaderMapData = {
  height: number;
  isSticky?: boolean;
};
export type RowHeaderMap = Record<string, RowHeaderMapData>;
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
//

/** Name from keydown event */
type EventKeyName = string;
export interface IKeyMappingMapping {
  /**
   * Return `false` to prevent default
   */
  [key: EventKeyName]: () => boolean | void;
}
export type VimIdMapKeys = keyof typeof VIM_ID_MAP;
export type InputMap = Record<Id, KeyBindingModes>;
export type InstancesMap = Record<
  Id,
  { options: VimOptions; bindings?: KeyBindingModes; vimCore: VimCore }
>;
export interface KeyToCommandMap {
  mappings: IKeyMappingMapping;
  additionalKeyBindings: KeyBindingModes;
}
export interface RegisterOptions {
  reInit?: boolean;
}
