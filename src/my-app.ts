import { observable } from "aurelia";
import { getWordAtIndex, tokenize } from "./modules/strings";
import { getRandomWordsFromSetAndRemove } from "./modules/random";
import { getDefinition } from "./modules/dictionary";
import { Tabs } from "./ui/organisms/tab-drawer/tab-drawer";
import { Topic } from "./types";
import { database } from "./modules/database";
import { APP_NAME } from "./modules/constants";

interface Features {
  remember: Set<string>;
  topics: {
    id: string;
    title: string;
  }[];
}

/*prettier-ignore*/ const WORDS = [ "live", "chat", "is", "unavailable", "for", "this", "stream", "it", "may", "have", "been", "disabled", "by", "the", "uploader", ]
// /*prettier-ignore*/ const WORDS = ["as", "ht"]
const AMOUNT_OF_WORDS = 12;
const TOPICS: Tabs[] = [
  {
    title: "Topics",
  },
  {
    title: "Remember",
  },
  {
    title: "Dictionary",
  },
];

export class MyApp {
  public appName = APP_NAME;
  public topics = TOPICS;
  @observable public newInputText = "";
  public typedText = "";
  public currentLetter = "";
  public currentTextToType = "";
  public remainingWordsToType: Set<string> = new Set(WORDS);
  public nextWordsToType: Set<string> = new Set();

  public rememberList: Features["remember"] = new Set();
  public dictionaryLookedUpList: Set<string> = new Set();

  public isDrawerOpen = false;

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
  }

  public handleTyping(key: string): void {
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
        const definition = getDefinition(wordAtIndex);
        /*prettier-ignore*/ console.log("[my-app.ts,78] definition: ", definition);
        this.dictionaryLookedUpList.add(wordAtIndex);
        database.setItem({
          dictionaryLookedUpList: Array.from(this.dictionaryLookedUpList),
        });
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

  public onTopicChange = (topic: Topic): void => {
    const text = topic.content.map((item) => item.text).join(" ");
    this.newInputTextChanged(text);
  };

  private resetTyping() {
    this.typedText = "";
    this.currentLetter = "";
    this.currentTextToType = "";
  }
}
