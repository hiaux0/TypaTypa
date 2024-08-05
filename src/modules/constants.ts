import { DatabaseType, Topic } from "../types";
import { Tabs } from "../ui/organisms/tab-drawer/tab-drawer";
import { generateId } from "./random";
import { getTranslation } from "./translations";

export const APP_NAME = "TypaTypa";

export const AMOUNT_OF_WORDS = 12;
export const TOPICS: Tabs[] = [
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

const DEFAULT_TOPICS: Topic[] = [
  {
    id: generateId(),
    title: getTranslation("introduction"),
    content: [{ id: generateId(), text: `Welcome to the TypaTypa App :)

This app has 2 purposes:
1. Improve your typing speed.
2. Improve your vocabulary.
` }],
  },
];

export const defaultDatabaseType: DatabaseType = {
  topics: DEFAULT_TOPICS,
  selectedTopicId: DEFAULT_TOPICS[0].id,
  rememberList: [],
  dictionaryLookedUpList: [],
};
