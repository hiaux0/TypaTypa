import { EventAggregator, inject, resolve } from "aurelia";
import { Store } from "../../../common/modules/store";
import "./typing-page.scss";
import { ShortcutService } from "../../../common/services/ShortcutService";
import { getIsInputActive } from "../../../common/modules/htmlElements";
import { database } from "../../../common/modules/database";
import { AMOUNT_OF_WORDS, WORDS } from "../../../common/modules/constants";
import {
  getIndexForwardUntil,
  getWordAtIndex,
  tokenize,
} from "../../../common/modules/strings";
import { Features, Topic } from "../../../types";
import { getRandomWordsFromSetAndRemove } from "../../../common/modules/random";
import { ON_TOPIC_CHANGE } from "../../../common/modules/eventMessages";

// @inject(EventAggregator, Store)
export class TypingPage {
  public message = "typing-page.html";
  public currentLetter = "";
  public separateInputValue = "";
  public upcommingTextToType = "";
  public typedText = "";
  public currentWord = "";
  public poolOfWords: Set<string> = new Set([]);
  public remainingWordsToType: Set<string> = new Set(WORDS);
  public nextWordsToType: Set<string> = new Set();
  public rememberList: Features["remember"] = new Set();

  constructor(
    private ea: EventAggregator = resolve(EventAggregator),
    private store: Store = resolve(Store),
  ) {}

  attached() {
    const dbData = database.getItem();
    this.rememberList = new Set(dbData.rememberList);
    const selectedTopic = database.getSelectedTopic();
    this.onTopicChange(selectedTopic);
    this.ea.subscribe(ON_TOPIC_CHANGE, this.onTopicChange);

    document // this.dictionaryLookedUpList = new Set(dbData.dictionaryLookedUpList);
      .addEventListener("keydown", (event) => {
        this.handleTyping(event.key);
        this.handleShortcuts(event.key);
        ShortcutService.clickGlobalShortcut(event.key);
      });
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
        this.store.isDrawerOpen = false;
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

  public lookUp(word: string): void {
    this.store.activeTabName = "";
    // 1. Look up word in dictionary
    this.store.dictionaryLookedUpList.add(word);
    //database.setItem({
    //  dictionaryLookedUpList: Array.from(this.dictionaryLookedUpList),
    //});

    // 2. Set active tab to Dictionary
    this.store.wordToLookUp = word;
    this.store.activeTabName = "Dictionary";
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

  // public separateInputChanged(event: Event): void {
  public separateInputChanged(): void {
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
