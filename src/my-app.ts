import { observable } from "aurelia";
import {
  getIndexForwardUntil,
  getWordAtIndex,
  tokenize,
} from "./modules/strings";
import { getRandomWordsFromSetAndRemove } from "./modules/random";
import { Topic } from "./types";
import { database } from "./modules/database";
import {
  AMOUNT_OF_WORDS,
  APP_NAME,
  INITIAL_APP_STATE,
  SELECTED_TAB_TITLE,
  TABS,
  WORD_TO_LOOK_UP,
} from "./modules/constants";
import { initDebugShortcuts } from "./modules/debugging";
import { getIsInputActive } from "./modules/htmlElements";
import { ShortcutService } from "./services/ShortcutService";
import { route } from "@aurelia/router-lite";
import { TypingPage } from "./ui/pages/typing-page/typing-page";
import { PropagandaPage } from "./ui/pages/propaganda-page/propaganda-page";

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

@route({
  title: APP_NAME,
  routes: [
    {
      path: ['typing'],
      component: TypingPage,
      title: 'Typing',
    },
    {
      path: "asht",
      component: PropagandaPage,
      title: "ASHT",
    },
  ],
})
export class MyApp {
  public appName = APP_NAME;
  public topics = TABS;
  public typedText = "";
  public currentLetter = "";
  public currentWord = "";
  public upcommingTextToType = "";
  public poolOfWords: Set<string> = new Set([]);
  public remainingWordsToType: Set<string> = new Set(WORDS);
  public nextWordsToType: Set<string> = new Set();

  public rememberList: Features["remember"] = new Set();
  public dictionaryLookedUpList: Set<string> = new Set();
  public separateInputValue = "";

  //public wordToLookUp = "";
  //public isDrawerOpen = false;
  //public activeTabName = "";
  public wordToLookUp = WORD_TO_LOOK_UP;
  public isDrawerOpen = INITIAL_APP_STATE.typing.tabs.isDrawerOpen ?? false;
  public activeTabName = SELECTED_TAB_TITLE;

  attached() {
    const dbData = database.getItem();
    this.rememberList = new Set(dbData.rememberList);
    // this.dictionaryLookedUpList = new Set(dbData.dictionaryLookedUpList);
    const selectedTopic = database.getSelectedTopic();
    this.onTopicChange(selectedTopic);

    document.addEventListener("keydown", (event) => {
      this.handleTyping(event.key);
      this.handleShortcuts(event.key);
      ShortcutService.clickGlobalShortcut(event.key);
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
      this.resetCurrentRound();
      this.selectWordsToType();
    }

    // No more words
    if (this.remainingWordsToType.size === 0) {
      this.resetWholeSession();
    }
  }

  public handleShortcuts(key: string): void {
    // /*prettier-ignore*/ console.log("[my-app.ts,93] key: ", key);
    const isActive = getIsInputActive();
    if (isActive) return;
    const index = this.typedText.length;
    const text = this.typedText + this.currentLetter + this.upcommingTextToType;
    const wordAtIndex = getWordAtIndex(text, index);
    switch (key) {
      case "Escape": {
        this.isDrawerOpen = false;
        break;
      }
      case "?": {
        this.lookUp(wordAtIndex);
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
        this.skipWord(index);
        break;
      }
    }
  }

  public skipWord(index: number) {
    const allText =
      this.typedText + this.currentLetter + this.upcommingTextToType;
    const endOfWordIndex = getIndexForwardUntil(allText, index);
    const nextWordIndex = endOfWordIndex + 1 + 1; // +1 for space, +1 for first letter of next word
    this.typedText = allText.slice(0, nextWordIndex);
    this.currentLetter = allText[nextWordIndex];
    this.upcommingTextToType = allText.slice(nextWordIndex + 1);
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
    const tokens = tokenize(text, { lower: true });
    this.poolOfWords = new Set(tokens);
    this.resetWholeSession();
    this.resetCurrentRound();
    this.selectWordsToType();
  };

  public lookUp(word: string): void {
    this.activeTabName = "";
    // 1. Look up word in dictionary
    this.dictionaryLookedUpList.add(word);
    //database.setItem({
    //  dictionaryLookedUpList: Array.from(this.dictionaryLookedUpList),
    //});

    // 2. Set active tab to Dictionary
    this.wordToLookUp = word;
    this.activeTabName = "Dictionary";
  }

  public separateInputChanged(event: Event): void {
    // const text = (event as any).data as string;
    const text = this.separateInputValue;
    if (!text) return;
    if (!text.endsWith(" ")) return;
    const separateInputWord = text.trim();

    const index = this.typedText.length;
    const all = this.typedText + this.currentLetter + this.upcommingTextToType;
    const wordAtIndex = getWordAtIndex(all, index);

    if (separateInputWord === wordAtIndex) {
      // only clear if word is correct
      this.separateInputValue = "";
      this.skipWord(index);

      if (this.upcommingTextToType.length === 0) {
        this.resetCurrentRound();
        this.resetWholeSession();
        this.selectWordsToType();
      }
    }
  }

  public onKeyDownSeparateInput(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.separateInputValue = "";
    }
  }

  private resetCurrentRound() {
    this.typedText = "";
    this.currentLetter = "";
    this.upcommingTextToType = "";
  }

  private resetWholeSession() {
    this.remainingWordsToType = this.poolOfWords;
  }
}
