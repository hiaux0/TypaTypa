import { TypingDatabaseType, Topic, Tabs } from "../../types";
import { generateId } from "./random";
import { getTranslation } from "./translations";

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 */
export const legacyKeyCodes = {
  DOM_VK_CANCEL: 3,
  DOM_VK_HELP: 6,
  DOM_VK_BACK_SPACE: 8,
  DOM_VK_TAB: 9,
  DOM_VK_CLEAR: 12,
  DOM_VK_RETURN: 13,
  DOM_VK_ENTER: 14,
  DOM_VK_SHIFT: 16,
  DOM_VK_CONTROL: 17,
  DOM_VK_ALT: 18,
  DOM_VK_PAUSE: 19,
  DOM_VK_CAPS_LOCK: 20,
  DOM_VK_ESCAPE: 27,
  DOM_VK_SPACE: 32,
  DOM_VK_PAGE_UP: 33,
  DOM_VK_PAGE_DOWN: 34,
  DOM_VK_END: 35,
  DOM_VK_HOME: 36,
  DOM_VK_LEFT: 37,
  DOM_VK_UP: 38,
  DOM_VK_RIGHT: 39,
  DOM_VK_DOWN: 40,
  DOM_VK_PRINTSCREEN: 44,
  DOM_VK_INSERT: 45,
  DOM_VK_DELETE: 46,
  DOM_VK_0: 48,
  DOM_VK_1: 49,
  DOM_VK_2: 50,
  DOM_VK_3: 51,
  DOM_VK_4: 52,
  DOM_VK_5: 53,
  DOM_VK_6: 54,
  DOM_VK_7: 55,
  DOM_VK_8: 56,
  DOM_VK_9: 57,
  DOM_VK_SEMICOLON: 59,
  DOM_VK_EQUALS: 61,
  DOM_VK_A: 65,
  DOM_VK_B: 66,
  DOM_VK_C: 67,
  DOM_VK_D: 68,
  DOM_VK_E: 69,
  DOM_VK_F: 70,
  DOM_VK_G: 71,
  DOM_VK_H: 72,
  DOM_VK_I: 73,
  DOM_VK_J: 74,
  DOM_VK_K: 75,
  DOM_VK_L: 76,
  DOM_VK_M: 77,
  DOM_VK_N: 78,
  DOM_VK_O: 79,
  DOM_VK_P: 80,
  DOM_VK_Q: 81,
  DOM_VK_R: 82,
  DOM_VK_S: 83,
  DOM_VK_T: 84,
  DOM_VK_U: 85,
  DOM_VK_V: 86,
  DOM_VK_W: 87,
  DOM_VK_X: 88,
  DOM_VK_Y: 89,
  DOM_VK_Z: 90,
  DOM_VK_CONTEXT_MENU: 93,
  DOM_VK_NUMPAD0: 96,
  DOM_VK_NUMPAD1: 97,
  DOM_VK_NUMPAD2: 98,
  DOM_VK_NUMPAD3: 99,
  DOM_VK_NUMPAD4: 100,
  DOM_VK_NUMPAD5: 101,
  DOM_VK_NUMPAD6: 102,
  DOM_VK_NUMPAD7: 103,
  DOM_VK_NUMPAD8: 104,
  DOM_VK_NUMPAD9: 105,
  DOM_VK_MULTIPLY: 106,
  DOM_VK_ADD: 107,
  DOM_VK_SEPARATOR: 108,
  DOM_VK_SUBTRACT: 109,
  DOM_VK_DECIMAL: 110,
  DOM_VK_DIVIDE: 111,
  DOM_VK_F1: 112,
  DOM_VK_F2: 113,
  DOM_VK_F3: 114,
  DOM_VK_F4: 115,
  DOM_VK_F5: 116,
  DOM_VK_F6: 117,
  DOM_VK_F7: 118,
  DOM_VK_F8: 119,
  DOM_VK_F9: 120,
  DOM_VK_F10: 121,
  DOM_VK_F11: 122,
  DOM_VK_F12: 123,
  DOM_VK_F13: 124,
  DOM_VK_F14: 125,
  DOM_VK_F15: 126,
  DOM_VK_F16: 127,
  DOM_VK_F17: 128,
  DOM_VK_F18: 129,
  DOM_VK_F19: 130,
  DOM_VK_F20: 131,
  DOM_VK_F21: 132,
  DOM_VK_F22: 133,
  DOM_VK_F23: 134,
  DOM_VK_F24: 135,
  DOM_VK_NUM_LOCK: 144,
  DOM_VK_SCROLL_LOCK: 145,
  DOM_VK_COMMA: 188,
  DOM_VK_PERIOD: 190,
  DOM_VK_SLASH: 191,
  DOM_VK_BACK_QUOTE: 192,
  DOM_VK_OPEN_BRACKET: 219,
  DOM_VK_BACK_SLASH: 220,
  DOM_VK_CLOSE_BRACKET: 221,
  DOM_VK_QUOTE: 222,
  DOM_VK_META: 224,
};

export const specialChars = "`~!@#%^&*()\\-+=[]{}|;:'\",.<>/?";
export const specialCharsSet = new Set(specialChars);

export const APP_NAME = "TypaTypa";

export const INITIAL_APP_STATE = {
  zen: true,
  typing: {
    tabs: {
      isDrawerOpen: false,
    },
  },
};

export const AMOUNT_OF_WORDS = 12;
export const TABS: Tabs[] = [
  {
    title: "Topics",
    shortcut: "T",
  },
  {
    title: "Dictionary",
    shortcut: "D",
  },
  {
    title: "Remember",
    shortcut: "R",
  },
];

export const WORD_TO_LOOK_UP = "";
export const SELECTED_TAB_INDEX = 1;
export const SELECTED_TAB_TITLE = TABS[SELECTED_TAB_INDEX]?.title;

const DEFAULT_TOPICS: Topic[] = [
  {
    id: generateId(),
    title: getTranslation("introduction"),
    content: [
      {
        id: generateId(),
        // text: 'apply hello agree world around okay amazing bro'
        text: `Welcome to the TypaTypa App :)

This app has 2 purposes:
1. Improve your typing speed.
2. Improve your vocabulary.
`,
      },
    ],
  },
];

export const defaultDatabaseType: TypingDatabaseType = {
  topics: DEFAULT_TOPICS,
  selectedTopicId: DEFAULT_TOPICS[0].id,
  rememberList: [],
  dictionaryLookedUpList: [],
};

// /*prettier-ignore*/ export const WORDS = [ "live", "chat", "is", "unavailable", "for", "this", "stream", "it", "may", "have", "been", "disabled", "by", "the", "uploader", ]
// /*prettier-ignore*/ export const WORDS = ["are", "after"]
/*prettier-ignore*/ export const WORDS = []

export const _gridSection = "";

export const CELL_COORDS = (columnIndex: number, rowIndex: number) =>
  // `cell-selected[${columnIndex}:${rowIndex}]`;
  `${columnIndex}:${rowIndex}`;
export const EV_GRID_CELL = (columnIndex: number, rowIndex: number) =>
  `grid-cell-[${columnIndex}:${rowIndex}]`;

export const VIM_ID_MAP = {
  gridCell: "gridCell",
  gridNavigation: "gridNavigation",
};

//export const VIM_CONTEXT = {
//  ...pickKeysFromObject(VIM_ID_MAP, ["gridCell"]),
//};

export function pickKeysFromObject<T, Keys extends keyof T>(
  obj: T,
  keys: Keys[],
): T {
  const picked = keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as T);
  return picked;
}

export const CELL_HEIGHT = 48;
export const CELL_WIDTH = 64;
export const INITIAL_COLUMN_COUNT = 10;
export const INITIAL_ROW_COUNT = 5;
export const PADDING = 6;
export const PADDING_LEFT = 6;
export const BORDER_WIDTH = 1;
