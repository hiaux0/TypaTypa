import { ModifiersType } from "../../common/modules/keybindings/app-keys";

export enum VIM_COMMAND {
  "backspace" = "backspace",
  "cancelAll" = "cancelAll",
  "clearLine" = "clearLine",
  "click" = "click",
  "createNewLine" = "createNewLine",
  "createNewLineAbove" = "createNewLineAbove",
  "copy" = "copy",
  "cursorRight" = "cursorRight",
  "cursorUp" = "cursorUp",
  "cursorLeft" = "cursorLeft",
  "cursorDown" = "cursorDown",
  "cursorWordForwardEnd" = "cursorWordForwardEnd",
  "cursorWordForwardStart" = "cursorWordForwardStart",
  "cursorBackwordsStartWord" = "cursorBackwordsStartWord",
  "cursorLineEnd" = "cursorLineEnd",
  "cursorLineStart" = "cursorLineStart",
  "delete" = "delete",
  "deleteInnerWord" = "deleteInnerWord",
  "deleteLine" = "deleteLine",
  "enterInsertAfterModeEnd" = "enterInsertAfterModeEnd",
  "enterInsertAfterMode" = "enterInsertAfterMode",
  "enterInsertMode" = "enterInsertMode",
  "enterInsertModeStart" = "enterInsertModeStart",
  "enterNormalMode" = "enterNormalMode",
  "enterVisualMode" = "enterVisualMode",
  "toggleFold" = "toggleFold",
  "goToFirstLine" = "goToFirstLine",
  "goToLastLine" = "goToLastLine",
  "indentRight" = "indentRight",
  "indentLeft" = "indentLeft",
  "joinLine" = "joinLine",
  "jumpNextBlock" = "jumpNextBlock",
  "jumpPreviousBlock" = "jumpPreviousBlock",
  "newLine" = "newLine",
  "paste" = "paste",
  "pasteVim" = "pasteVim",
  "redo" = "redo",
  "repeatLastCommand" = "repeatLastCommand",
  "replace" = "replace",
  "snippet" = "snippet",
  "space" = "space",
  "toCharacterAtBack" = "toCharacterAtBack",
  "toCharacterAt" = "toCharacterAt",
  "toCharacterAfterBack" = "toCharacterAfterBack",
  "toCharacterBefore" = "toCharacterBefore",
  "type" = "type",
  "undo" = "undo",
  "unfoldAll" = "unfoldAll",
  "yank" = "yank",
  "visualDelete" = "visualDelete",
  "visualInnerWord" = "visualInnerWord",
  "visualInnerBlock" = "visualInnerBlock",
  "visualStartLineWise" = "visualStartLineWise",
  "visualMoveToOtherEndOfMarkedArea" = "visualMoveToOtherEndOfMarkedArea",
  // custom
  "toggleCheckbox" = "toggleCheckbox",
  "hint" = "hint",
  "shift" = "shift",
  "customExecute" = "customExecute",
  "nothing" = "nothing",
}

export const VIM_MODE_COMMANDS = [
  VIM_COMMAND["enterInsertMode"],
  VIM_COMMAND["enterInsertModeStart"],
  VIM_COMMAND["enterNormalMode"],
  VIM_COMMAND["enterVisualMode"],
  VIM_COMMAND["visualStartLineWise"],
  VIM_COMMAND["createNewLine"],
  VIM_COMMAND["createNewLineAbove"],
  VIM_COMMAND["enterInsertAfterModeEnd"],
  VIM_COMMAND["enterInsertAfterMode"],
];

export const VIM_COMMANDS = [
  VIM_COMMAND.newLine,
  VIM_COMMAND["backspace"],
  VIM_COMMAND["createNewLine"],
  VIM_COMMAND["createNewLineAbove"],
  VIM_COMMAND["cursorRight"],
  VIM_COMMAND["cursorUp"],
  VIM_COMMAND["cursorLeft"],
  VIM_COMMAND["cursorDown"],
  VIM_COMMAND["cursorWordForwardEnd"],
  VIM_COMMAND["cursorWordForwardStart"],
  VIM_COMMAND["cursorBackwordsStartWord"],
  VIM_COMMAND["cursorLineEnd"],
  VIM_COMMAND["cursorLineStart"],
  VIM_COMMAND["delete"],
  VIM_COMMAND["deleteLine"],
  VIM_COMMAND["deleteInnerWord"],

  VIM_COMMAND["indentRight"],
  VIM_COMMAND["indentLeft"],
  VIM_COMMAND["joinLine"],
  VIM_COMMAND["jumpNextBlock"],
  VIM_COMMAND["jumpPreviousBlock"],
  VIM_COMMAND["newLine"],
  VIM_COMMAND["paste"],
  VIM_COMMAND["replace"],
  VIM_COMMAND["space"],
  VIM_COMMAND["toCharacterAtBack"],
  VIM_COMMAND["toCharacterAt"],
  VIM_COMMAND["toCharacterAfterBack"],
  VIM_COMMAND["toCharacterBefore"],
  VIM_COMMAND["type"],
  VIM_COMMAND["unfoldAll"],
  VIM_COMMAND["yank"],
  // visual
  VIM_COMMAND["visualDelete"],
  VIM_COMMAND["visualInnerWord"],
  VIM_COMMAND["visualInnerBlock"],
  VIM_COMMAND["visualStartLineWise"],
  VIM_COMMAND["visualMoveToOtherEndOfMarkedArea"],
  // ...VIM_MODE_COMMANDS,
  VIM_COMMAND["enterInsertMode"],
  VIM_COMMAND["enterInsertModeStart"],
  VIM_COMMAND["enterNormalMode"],
  VIM_COMMAND["enterVisualMode"],
];
export type VimCommandNames = keyof typeof VIM_COMMAND;

export const VIM_COMMANDS_THAT_CHANGE_TO_NORMAL_MODE = ["visualDelete"];

export interface VimCommand {
  /**
   * Modifiers: <mod>
   * Full: <modA><modB>keyAkeyB
   */
  key: string;
  command?: VimCommandNames;
  sequence?: string;
  execute?: () => void;
  args?: {
    text?: string;
  };
  desc?: string;
}

export interface SynonymKey {
  [key: string]: ModifiersType;
}
