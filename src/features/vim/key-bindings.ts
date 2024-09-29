// Naming based on https://vim.rtorr.com/

import {
  ALT,
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  BACKSPACE,
  CONTROL,
  DELETE,
  ENTER,
  ESCAPE,
  OS,
  SHIFT,
  SPACE,
  TAB,
} from "../../common/modules/keybindings/app-keys";
import { VimCommand, VIM_COMMAND } from "./vim-commands-repository";
import { KeyBindingModes, VimMode } from "./vim-types";

export const Modifier = {
  "<Alt>": "<Alt>",
  "<ArrowUp>": "<ArrowUp>",
  "<ArrowDown>": "<ArrowDown>",
  "<ArrowLeft>": "<ArrowLeft>",
  "<ArrowRight>": "<ArrowRight>",
  "<Backspace>": "<Backspace>",
  "<Control>": "<Control>",
  "<Delete>": "<Delete>",
  "<Enter>": "<Enter>",
  "<Escape>": "<Escape>",
  "<Meta>": "<Meta>",
  "<OS>": "<OS>",
  "<Shift>": "<Shift>",
  "<Space>": "<Space>",
  "<Tab>": "<Tab>",
};

const commandsAllModes: VimCommand[] = [
  { key: "<Control>c", command: "copy" },
  { key: "<Control>z", command: "undo" },
  { key: "<Control><Shift>z", command: "redo" },
  { key: "<Escape>", command: "enterNormalMode" },
];
/**
 * The very next input
 * TODO: rename? `...VeryNextInput`
 */
export const commandsThatWaitForNextInput: VimCommand[] = [
  { key: "F", command: VIM_COMMAND["toCharacterAtBack"] },
  { key: "f", command: VIM_COMMAND["toCharacterAt"] },
  { key: "r", command: VIM_COMMAND["replace"] },
  { key: "T", command: VIM_COMMAND["toCharacterAfterBack"] },
  { key: "t", command: VIM_COMMAND["toCharacterBefore"] },
  // { key: `${Modifier['<Space>']}tc`, command: VIM_COMMAND.space },
];

const cursorAllModes: VimCommand[] = [
  { key: "<ArrowLeft>", command: "cursorLeft" },
  { key: "<ArrowUp>", command: "cursorUp" },
  { key: "<ArrowRight>", command: "cursorRight" },
  { key: "<ArrowDown>", command: "cursorDown" },
];

export const cursorNormalAndInsert: VimCommand[] = [
  { key: "<Control>]", command: "indentRight" },
  { key: "<Control>[", command: "indentLeft" },
];

const cursorNormalAndVisual: VimCommand[] = [
  { key: "b", command: "cursorBackwordsStartWord" }, // jump backwards to the start of a word
  { key: "e", command: "cursorWordForwardEnd" },
  { key: "gg", command: "goToFirstLine" },
  { key: "h", command: "cursorLeft" },
  { key: "k", command: "cursorUp" },
  { key: "l", command: "cursorRight" },
  { key: "u", command: "cursorDown" },
  { key: "w", command: "cursorWordForwardStart" },
  { key: "<Shift>G", command: "goToLastLine" },
  { key: "<Shift>$", command: "cursorLineEnd" },
  { key: "$", command: "cursorLineEnd" },
  { key: "<Shift>^", command: "cursorLineStart" },
  { key: "^", command: "cursorLineStart" },
  { key: "<Shift>}", command: "jumpNextBlock" },
  { key: "}", command: "jumpNextBlock" },
  { key: "<Shift>{", command: "jumpPreviousBlock" },
  { key: "{", command: "jumpPreviousBlock" },
  ...commandsThatWaitForNextInput,
];

export const keyBindings: KeyBindingModes = {
  normal: [],
  [VimMode.NORMAL]: [
    // { key: "<Space>", command: "vimLeader" },
    { key: "<Space>tc", sequence: "^elrx" },
    { key: "<Space>fu", command: VIM_COMMAND.unfoldAll },
    { key: "a", command: VIM_COMMAND.enterInsertAfterMode },
    { key: "cc", command: "clearLine" },
    { key: "dd", command: "deleteLine" },
    { key: "diw", command: "deleteInnerWord" },
    { key: "i", command: "enterInsertMode" },
    { key: "<Shift>I", command: VIM_COMMAND.enterInsertModeStart },
    { key: "J", command: "joinLine" },
    { key: "o", command: "createNewLine" },
    { key: "<Shift>O", command: VIM_COMMAND.createNewLineAbove },
    { key: "p", command: VIM_COMMAND.pasteVim },
    { key: "v", command: "enterVisualMode" },
    { key: "<Shift>V", command: "visualStartLineWise" },
    { key: "x", command: "delete" },
    { key: "y", command: "yank" },
    { key: "za", command: "toggleFold" },
    { key: ".", command: VIM_COMMAND.repeatLastCommand },
    { key: "gh", command: "hint" },
    { key: "<Shift>A", command: VIM_COMMAND.enterInsertAfterModeEnd },
    { key: "<Control>v", command: "paste" },
    { key: "<Enter>", command: "newLine" },
    { key: "<Backspace>", command: "backspace" },
    { key: "<Meta>", command: "nothing" },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndInsert,
    ...cursorNormalAndVisual,
  ],
  insert: [],
  [VimMode.INSERT]: [
    { key: "<Backspace>", command: "backspace" },
    { key: "<Delete>", command: "delete" },
    { key: "<Enter>", command: "newLine" },
    { key: "<Shift>", command: "shift" },
    { key: Modifier["<Space>"], command: "space" },
    { key: "<Control>", command: "nothing" },
    { key: "<Tab>", command: "indentRight" },
    { key: "<Shift><Tab>", command: "indentLeft" },
    // snippets
    ...commandsAllModes,
    ...cursorAllModes,
  ],
  visual: [],
  [VimMode.VISUAL]: [
    { key: "iw", command: "visualInnerWord" },
    { key: "ii", command: VIM_COMMAND.visualInnerBlock },
    { key: "d", command: "visualDelete" },
    { key: "o", command: "visualMoveToOtherEndOfMarkedArea" },
    { key: "x", command: "visualDelete" },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndVisual,
  ],

  visualline: [],
  [VimMode.VISUALLINE]: [
    { key: "d", command: "visualDelete" },
    { key: "o", command: "visualMoveToOtherEndOfMarkedArea" },
    { key: "x", command: "visualDelete" },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndVisual,
  ],
  synonyms: {
    "<esc>": "<Escape>",
    escape: "<Escape>",
  },
};

export function isAlt(newInput: string) {
  return newInput === ALT || newInput === Modifier["<Alt>"];
}
export function isArrowUp(newInput: string) {
  return newInput === ARROW_UP || newInput === Modifier["<ArrowUp>"];
}
export function isArrowDown(newInput: string) {
  return newInput === ARROW_DOWN || newInput === Modifier["<ArrowDown>"];
}
export function isArrowLeft(newInput: string) {
  return newInput === ARROW_LEFT || newInput === Modifier["<ArrowLeft>"];
}
export function isArrowRight(newInput: string) {
  return newInput === ARROW_RIGHT || newInput === Modifier["<ArrowRight>"];
}
export function isBackspace(newInput: string) {
  return newInput === BACKSPACE || newInput === Modifier["<Backspace>"];
}
export function isControl(newInput: string) {
  return newInput === CONTROL || newInput === Modifier["<Control>"];
}
export function isDelete(newInput: string) {
  return newInput === DELETE || newInput === Modifier["<Delete>"];
}
export function isEnter(newInput: string) {
  return newInput === ENTER || newInput === Modifier["<Enter>"];
}
export function isEscape(newInput: string) {
  return newInput === ESCAPE || newInput === Modifier["<Escape>"];
}
export function isOs(newInput: string) {
  return newInput === OS || newInput === Modifier["<OS>"];
}
export function isShift(newInput: string) {
  return newInput === SHIFT || newInput === Modifier["<Shift>"];
}
export function isSpace(newInput: string) {
  return newInput === SPACE || newInput === Modifier["<Space>"];
}
export function isTab(newInput: string) {
  return newInput === TAB || newInput === Modifier["<Tab>"];
}