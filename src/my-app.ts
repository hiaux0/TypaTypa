import { observable } from "aurelia";
import {
  getIndexForwardUntil,
  getWordAtIndex,
  tokenize,
} from "./modules/strings";
import { getRandomWordsFromSetAndRemove } from "./modules/random";
import { getDefinition } from "./modules/dictionary";
import { Tabs } from "./ui/organisms/tab-drawer/tab-drawer";
import { Topic } from "./types";
import { database } from "./modules/database";
import { APP_NAME } from "./modules/constants";
import { initDebugShortcuts } from "./modules/debugging";
import { getIsInputActive } from "./modules/htmlElements";

interface Features {
  remember: Set<string>;
  topics: {
    id: string;
    title: string;
  }[];
}

// /*prettier-ignore*/ const WORDS = [ "live", "chat", "is", "unavailable", "for", "this", "stream", "it", "may", "have", "been", "disabled", "by", "the", "uploader", ]
// /*prettier-ignore*/ const WORDS = ["are", "after"]
/*prettier-ignore*/ const WORDS = []
const AMOUNT_OF_WORDS = 12;
const TOPICS: Tabs[] = [
  {
    title: "Topics",
  },
  {
    title: "Dictionary",
  },
  {
    title: "Remember",
  },
];

export class MyApp {
  public appName = APP_NAME;
  public topics = TOPICS;
  @observable public newInputText = "";
  public typedText = "";
  public currentLetter = "";
  public upcommingTextToType = "";
  public remainingWordsToType: Set<string> = new Set(WORDS);
  public nextWordsToType: Set<string> = new Set();

  public rememberList: Features["remember"] = new Set();
  public dictionaryLookedUpList: Set<string> = new Set();

  public wordToLookUp = "";
  public isDrawerOpen = false;
  public activeTabName = "";
  //public wordToLookUp = "after";
  //public isDrawerOpen = true;
  //public activeTabName = "Dictionary";

  public newInputTextChanged(newText: string): void {
    const tokens = tokenize(newText, { lower: true });
    this.remainingWordsToType = new Set(tokens);
    this.resetTyping();
    this.selectWordsToType();
  }

  attached() {
    const dbData = database.getItem();
    this.rememberList = new Set(dbData.rememberList);
    this.dictionaryLookedUpList = new Set(dbData.dictionaryLookedUpList);
    const selectedTopic = database.getSelectedTopic();
    this.onTopicChange(selectedTopic);

    document.addEventListener("keydown", (event) => {
      this.handleTyping(event.key);
      this.handleShortcuts(event.key);
    });
    initDebugShortcuts();
  }

  public handleTyping(key: string): void {
    const isActive = getIsInputActive();
    if (isActive) return;
    const advance = key === this.currentLetter;
    const shouldGiveNextWords = this.upcommingTextToType === "";
    if (advance && !shouldGiveNextWords) {
      this.typedText += key;
      this.currentLetter = this.upcommingTextToType[0];
      this.upcommingTextToType = this.upcommingTextToType.slice(1);
    }

    // Each typing round
    else if (shouldGiveNextWords) {
      this.resetTyping();
      this.selectWordsToType();
    }

    // No more words
    if (this.remainingWordsToType.size === 0) {
      this.remainingWordsToType = new Set(WORDS);
    }
  }

  public handleShortcuts(key: string): void {
    const isActive = getIsInputActive();
    if (isActive) return;
    const index = this.typedText.length;
    const text = this.typedText + this.currentLetter + this.upcommingTextToType;
    const wordAtIndex = getWordAtIndex(text, index);
    switch (key) {
      case "?": {
        // 1. Look up word in dictionary
        this.dictionaryLookedUpList.add(wordAtIndex);
        database.setItem({
          dictionaryLookedUpList: Array.from(this.dictionaryLookedUpList),
        });

        // 2. Set active tab to Dictionary
        this.wordToLookUp = wordAtIndex;
        /*prettier-ignore*/ console.log("[my-app.ts,110] this.wordToLookUp: ", this.wordToLookUp);
        this.activeTabName = "Dictionary";
        break;
      }
      case "+": {
        this.rememberList.add(wordAtIndex);
        database.setItem({ rememberList: Array.from(this.rememberList) });
        break;
      }
      case "-": {
        this.rememberList.delete(wordAtIndex);
        break;
      }
      case ".": {
        const endOfWordIndex = getIndexForwardUntil(text, index);
        const nextWordIndex = endOfWordIndex + 1 + 1; // +1 for space, +1 for first letter of next word
        console.log("todo: skip word");
        this.typedText = text.slice(0, nextWordIndex);
        this.currentLetter = text[nextWordIndex];
        this.upcommingTextToType = text.slice(nextWordIndex + 1);
        break;
      }
    }
  }

  public selectWordsToType() {
    const { chosen, remaining } = getRandomWordsFromSetAndRemove(
      this.remainingWordsToType,
      AMOUNT_OF_WORDS,
    );
    this.nextWordsToType = chosen;
    this.remainingWordsToType = remaining;
    const nextAsString = Array.from(this.nextWordsToType).join(" ");
    this.currentLetter = nextAsString[0];
    this.upcommingTextToType = nextAsString.slice(1);
  }

  public onTopicChange = (topic: Topic | undefined): void => {
    if (!topic) return;
    const text = topic.content.map((item) => item.text).join(" ");
    this.newInputTextChanged(text);
  };

  private resetTyping() {
    this.typedText = "";
    this.currentLetter = "";
    this.upcommingTextToType = "";
  }
}
