import { DatabaseType, Topic } from "../types";
import { Tabs } from "../ui/organisms/tab-drawer/tab-drawer";
import { generateId } from "./random";
import { getTranslation } from "./translations";

export const APP_NAME = "TypaTypa";

export const INITIAL_APP_STATE = {
  typing: {
    tabs: {
      isDrawerOpen: true,
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

export const WORD_TO_LOOK_UP = "apply";
export const SELECTED_TAB_INDEX = 1;
export const SELECTED_TAB_TITLE = TABS[SELECTED_TAB_INDEX].title;

const DEFAULT_TOPICS: Topic[] = [
  {
    id: generateId(),
    title: getTranslation("introduction"),
    content: [
      {
        id: generateId(),
        text: `Welcome to the TypaTypa App :)

This app has 2 purposes:
1. Improve your typing speed.
2. Improve your vocabulary.
`,
      },
    ],
  },
];

export const defaultDatabaseType: DatabaseType = {
  topics: DEFAULT_TOPICS,
  selectedTopicId: DEFAULT_TOPICS[0].id,
  rememberList: [],
  dictionaryLookedUpList: [],
};
