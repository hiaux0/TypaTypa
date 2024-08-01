import { observable } from "aurelia";
import { getWordAtIndex, tokenize } from "./modules/strings";
import * as Dictionary from "./data/dictionary.json";
import { getRandomWordsFromSetAndRemove } from "./modules/random";

interface Features {
  remember: Set<string>;
  topics: {
    id: string;
    title: string;
  }[];
}

/*prettier-ignore*/ const WORDS = [ "live", "chat", "is", "unavailable", "for", "this", "stream", "it", "may", "have", "been", "disabled", "by", "the", "uploader", ]
// /*prettier-ignore*/ const WORDS = ["as", "ht"]
const AMOUNT_OF_WORDS = 2;

export class MyApp {
  public message = "Typing App cua Emy";
  @observable public newInputText = "";
  //private typedText = "Hello ";
  //private currentLetter = "w";
  //private currentTextToType = "e are typing";
  public typedText = "";
  public currentLetter = "";
  public currentTextToType = "";
  public remainingWordsToType: Set<string> = new Set(WORDS);
  public nextWordsToType: Set<string> = new Set();

  public rememberList: Features["remember"] = new Set();

  public newInputTextChanged(newText: string): void {
    const tokens = tokenize(newText, { lower: true });
    this.remainingWordsToType = new Set(tokens);
    this.resetTyping();
    this.selectWordsToType();
  }

  attached() {
    this.selectWordsToType();

    document.addEventListener("keydown", (event) => {
      this.handleTyping(event.key);
      this.handleShortcuts(event.key);
    });
  }

  public handleTyping(key: string): void {
    console.clear();
    console.log("this.currentTextToType: ", this.currentTextToType);
    const advance = key === this.currentLetter;
    const shouldGiveNextWords = this.currentTextToType === "";
    if (advance && !shouldGiveNextWords) {
      this.typedText += key;
      this.currentLetter = this.currentTextToType[0];
      this.currentTextToType = this.currentTextToType.slice(1);
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
    const index = this.typedText.length;
    const text = this.typedText + this.currentLetter + this.currentTextToType;
    const wordAtIndex = getWordAtIndex(text, index);
    switch (key) {
      case "?": {
        // const definition = Dictionary[wordAtIndex];
        break;
      }
      case "+": {
        this.rememberList.add(wordAtIndex);
        break;
      }
      case "-": {
        this.rememberList.delete(wordAtIndex);
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
    this.currentTextToType = nextAsString.slice(1);
  }

  private resetTyping() {
    this.typedText = "";
    this.currentLetter = "";
    this.currentTextToType = "";
  }
}
