import {
  EventAggregator,
  ICustomElementViewModel,
  customElement,
  inject,
  resolve,
} from "aurelia";
import { Store } from "../../../common/modules/store";
import "./typing-page.scss";
import { ShortcutService } from "../../../common/services/ShortcutService";
import { getIsInputActive } from "../../../common/modules/htmlElements";
import { typingDatabase } from "../../../common/modules/database/typingDatabase";
import { AMOUNT_OF_WORDS, TABS } from "../../../common/modules/constants";
import {
  getIndexForwardUntil,
  getWordAtIndex,
  tokenize,
} from "../../../common/modules/strings";
import { Features, Topic } from "../../../types";
import { getRandomWordsFromSetAndRemove } from "../../../common/modules/random";
import { ON_TOPIC_CHANGE } from "../../../common/modules/eventMessages";

const DEBUG_ORDERED_WORDS = true; // Set to true for ordered words, false for random

// @inject(EventAggregator, Store)

export class TypingPage implements ICustomElementViewModel {
  public message = "typing-page.html";
  public currentLetter = "";
  public separateInputValue = "";
  public upcommingTextToType = "";
  public typedText = "";
  public currentWord = "";
  public poolOfWords: Set<string> = new Set([]);
  public remainingWordsToType: Set<string> = new Set(); // Initialized in attached/onTopicChange
  public nextWordsToType: Set<string> = new Set();
  public rememberList: Features["remember"] = new Set();
  public topics = TABS;

  // New properties for ordered mode
  public orderedPoolOfWords: string[] = [];
  public currentWordIndexInPool = 0;

  constructor(
    private ea: EventAggregator = resolve(EventAggregator),
    private store: Store = resolve(Store),
  ) {}

  attached() {
    const dbData = typingDatabase.getItem();
    this.rememberList = new Set(dbData.rememberList);
    const selectedTopic = typingDatabase.getSelectedTopic();

    if (selectedTopic) {
      this.onTopicChange(selectedTopic);
    } else {
      // Handle case where no topic is initially selected
      this.poolOfWords = new Set(); // Default to empty pool
      this.orderedPoolOfWords = [];
      this.currentWordIndexInPool = 0;
      this.resetWholeSession(); // Initialize remainingWordsToType appropriately
      this.resetCurrentRound(); // Clear current typing state (e.g. typedText)
      this.selectWordsToType(); // Attempt to select words (will be empty if pool is empty)
    }

    this.ea.subscribe(ON_TOPIC_CHANGE, this.onTopicChange);

    document.addEventListener("keydown", (event) => {
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

    // No more words from the entire pool (specific to random mode)
    // Also ensure poolOfWords is not empty to prevent infinite reset loop if initial pool is empty.
    if (
      !DEBUG_ORDERED_WORDS &&
      this.remainingWordsToType.size === 0 &&
      this.poolOfWords.size > 0
    ) {
      this.resetWholeSession();
      // The next call to selectWordsToType (triggered when upcommingTextToType is empty)
      // will use the refilled remainingWordsToType.
    }
  }

  public handleShortcuts(key: string): void {
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
        typingDatabase.setItem({ rememberList: Array.from(this.rememberList) });
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
    if (!topic) {
      // If topic is undefined (e.g. no topic selected), set to empty state
      this.poolOfWords = new Set();
      this.orderedPoolOfWords = [];
      this.currentWordIndexInPool = 0;
    } else {
      const text = topic.content.map((item) => item.text).join(" ");
      const tokens = tokenize(text, { lower: true });
      this.poolOfWords = new Set(tokens);
      this.orderedPoolOfWords = Array.from(this.poolOfWords); // For ordered mode
      this.currentWordIndexInPool = 0; // Reset index for ordered mode
    }

    this.resetWholeSession(); // Resets remainingWordsToType and currentWordIndexInPool (if ordered)
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
    if (DEBUG_ORDERED_WORDS) {
      let wordsForThisRound: string[] = [];
      if (this.orderedPoolOfWords.length > 0) {
        const pool = this.orderedPoolOfWords;
        const poolSize = pool.length;
        const startIndexInPool = this.currentWordIndexInPool;

        for (let i = 0; i < AMOUNT_OF_WORDS; i++) {
          const actualIndex = (startIndexInPool + i) % poolSize; // Handles wrap-around
          wordsForThisRound.push(pool[actualIndex]);
        }
        // Update currentWordIndexInPool for the start of the *next* batch
        this.currentWordIndexInPool =
          (startIndexInPool + AMOUNT_OF_WORDS) % poolSize;
      }

      // Populate nextWordsToType (Set) for potential compatibility,
      // but use the ordered wordsForThisRound for the actual typing string.
      this.nextWordsToType = new Set(wordsForThisRound);
      const nextAsString = wordsForThisRound.join(" ");
      this.currentLetter = nextAsString[0] || ""; // Handle empty string case
      this.upcommingTextToType = nextAsString.slice(1);
    } else {
      // Original random mode
      const { chosen, remaining } = getRandomWordsFromSetAndRemove(
        this.remainingWordsToType,
        AMOUNT_OF_WORDS,
      );
      this.nextWordsToType = chosen;
      this.remainingWordsToType = remaining;
      // The order from Array.from(Set) is arbitrary but was the existing behavior for random.
      const nextAsString = Array.from(this.nextWordsToType).join(" ");
      this.currentLetter = nextAsString[0] || ""; // Handle empty string case
      this.upcommingTextToType = nextAsString.slice(1);
    }
  }

  public separateInputChanged(): void {
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
        this.selectWordsToType(); // This will fetch the next batch of words
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
    if (DEBUG_ORDERED_WORDS) {
      this.currentWordIndexInPool = 0;
      // In ordered mode, remainingWordsToType isn't the primary source for selection,
      // but initialize it based on the ordered pool for consistency or if other parts rely on it.
      this.remainingWordsToType = new Set(this.orderedPoolOfWords);
    } else {
      // In random mode, remainingWordsToType is replenished from the general poolOfWords.
      this.remainingWordsToType = new Set(this.poolOfWords);
    }
  }
}
