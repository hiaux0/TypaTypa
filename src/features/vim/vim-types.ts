import { ISnippet } from "../../common/modules/keybindings/snippets";
import { getRandomId } from "../../common/modules/random/random";
import { EditorId, Id } from "../../domain/types/types";
import { AbstractMode } from "./modes/AbstractMode";
import { NormalMode } from "./modes/NormalMode";
import { VisualLineMode } from "./modes/VisualLineMode";
import { VisualMode } from "./modes/VisualMode";
import {
  VimCommand,
  SynonymKey,
  VIM_COMMAND,
  VimCommandNames,
} from "./vim-commands-repository";
import { VimCore } from "./vimCore/VimCore";

type VimCore_TODO = "todo vim Core";

export interface KeyBindingModes {
  insert?: VimCommand[];
  [VimMode.INSERT]?: VimCommand[];
  normal?: VimCommand[];
  [VimMode.NORMAL]?: VimCommand[];
  visual?: VimCommand[];
  [VimMode.VISUAL]?: VimCommand[];
  visualline?: VimCommand[];
  [VimMode.VISUALLINE]?: VimCommand[];
  custom?: [];
  [VimMode.CUSTOM]?: VimCommand[];
  all?: [];
  [VimMode.ALL]?: VimCommand[];
}

export enum VimExecutingMode {
  "INDIVIDUAL" = "INDIVIDUAL",
  "BATCH" = "BATCH",
}

/**
 * Given a string 'Hello, World'
 * And I'm in normal mode
 * When I type "l"
 * Then the cursor should move one right
 */
export interface FindPotentialCommandReturn {
  targetCommand: VimCommand | undefined;
  potentialCommands: VimCommand[];
  keySequence?: string;
}

export type IndentationLevel = number;
export type Text = string;

export interface IndentationNode {
  text?: Text;
  indentation?: IndentationLevel;
}

export type LineId = string;
export interface VimLine extends IndentationNode {
  text: Text;
  id?: LineId; // Migration_1
  // cursor?: Cursor;
}

export const EMPTY_VIM_LINE: VimLine = { text: "", id: getRandomId() };

export type FoldMap = Record<string, boolean>;

export interface IVimState {
  id: EditorId;
  mode: VimMode;
  cursor?: Cursor;
  lines?: VimLine[];
  foldMap?: FoldMap;
  visualStartCursor?: Cursor;
  visualEndCursor?: Cursor;
  deletedLinesIndeces?: number[];
  /**
   * {
   *   "\"": [...],
   *   "+": [...],
   *   "*": [...],
   * }
   */
  deletedLines?: Record<string, VimLine[]>;
  /** * Should live in key mapping/binding? */
  commandName?: VimCommandNames;
  /** * Should live in key mapping/binding? */
  snippet?: ISnippet;
}

export interface QueueInputReturn {
  vimState: IVimState | null | undefined;
  targetCommand: VIM_COMMAND;
  targetCommandFull: VimCommand | undefined;
  keys: string;
}

/**
 * 0 based index
 */
export interface Cursor {
  col: number;
  line: number;
}
export enum VimMode {
  "NORMAL" = "NORMAL",
  "INSERT" = "INSERT",
  "VISUAL" = "VISUAL",
  "VISUALLINE" = "VISUALLINE",
  "CUSTOM" = "CUSTOM",
  "ALL" = "ALL",
}
export type VimModeKeys = keyof typeof VimMode;

export interface VimHooks {
  afterInit?: (
    vim: VimCore,
  ) => QueueInputReturn[] | Promise<QueueInputReturn[]> | void;
  onBeforeCommand?: () => boolean;
  onInsertInput?: (
    vimState: IVimState | undefined,
    wholeText: string | null,
    key: string,
  ) => boolean | void;
  commandListener?: CommandListener;
  modeChanged?: ModeChanged;
  vimStateUpdated?: (vimState: IVimState) => void;
}

export interface VimOptions {
  vimState?: IVimState;
  vimId?: Id;
  keyBindings?: KeyBindingModes;
  container?: HTMLElement;
  inputElement?: HTMLTextAreaElement;
  childSelector?: string;
  leader?: string;
  vimPlugins?: VimPlugin[];
  indentSize?: number;
  /**
   * Allow for last command to be repeated, if the last key matches
   */
  allowChaining?: boolean;
  /**
   * Allow for "family" of commands to be executed
   */
  allowExtendedChaining?: boolean;
  hooks?: VimHooks;
}

export interface VimPlugin {
  commandName: string;
  execute: (vimState?: IVimState, commandValue?: unknown) => IVimState | void;
}

export interface InputData {
  pressedKey: string;
  ev: KeyboardEvent;
  modifiersText: string;
}

export type CommandListener = (
  vimResult: QueueInputReturn,
  // inputData: InputData,
  // vim?: VimCore
) => void | IVimState;
export type ModeChanged = (
  vimResults: QueueInputReturn,
  newMode?: VimMode,
  oldMode?: VimMode,
  vim?: VimCore_TODO,
) => void | IVimState;

export interface VimEditorOptions {
  vimState?: IVimState;
  id?: EditorId;
  startCursor?: Cursor;
  startLines?: VimLine[];
  container?: HTMLElement;
  inputElement?: HTMLTextAreaElement;
  caret?: HTMLElement;
  childSelector?: string;
  removeTrailingWhitespace?: boolean;
  plugins?: VimPlugin[];
  afterInit?: (
    vim: VimCore_TODO,
  ) => QueueInputReturn[] | Promise<QueueInputReturn[]> | void;
  onBeforeCommand?: () => boolean;
  commandListener?: CommandListener;
  modeChanged?: ModeChanged;
  vimStateUpdated?: (vimState: IVimState) => void;
}
