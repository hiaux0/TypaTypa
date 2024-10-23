import { TypingDatabaseType, Topic, Tabs } from "../../types";
import { generateId } from "./random";
import { getTranslation } from "./translations";

export const APP_NAME = "TypaTypa";

export const INITIAL_APP_STATE = {
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
export const CELL_HEIGHT = 32;
export const CELL_WIDTH = 64;
export const INITIAL_COLUMN_COUNT = 20;
export const INITIAL_ROW_COUNT = 20;
