import { bindable } from "aurelia";
import "./dictionary.scss";
import { getDefinition } from "../../../modules/dictionary";
import { DictionaryLookUp, WordMeaning, WordType } from "../../../types";
import { getValueFromPixelString } from "../../../modules/strings";

export class Dictionary {
  @bindable() public word = "";
  public lookUpHistoryContainerRef: HTMLElement = null;
  public searchValue: string | undefined = undefined;
  public definition: DictionaryLookUp | undefined = undefined;
  // /*prettier-ignore*/ public lookUpHistory = new Set<string>(["applying", "apply", "more", "word", "go", "here", "therefore", "important", "timewise", "ashtashtsahtshshtashashtshtshaaaaaaatshtt"]);
  public lookUpHistory = new Set<string>([]);
  public wordType: WordType | undefined = undefined;
  public meanings: WordMeaning[] = [];
  public aboveHeaderTop = 0;

  wordChanged(newWord: string): void {
    if (!newWord) return;
    this.definition = getDefinition(newWord);
    if (Object.keys(this.definition?.MEANINGS ?? {}).length > 0) {
      this.meanings = Object.values(this.definition.MEANINGS);
    } else {
      this.meanings = [];
    }
    this.calculateAboveHeaderHeight();
  }

  attached() {
    this.calculateAboveHeaderHeight();
    this.wordChanged(this.word);
  }

  public lookUp = (word: string | undefined): void => {
    if (!word) return;
    this.word = word?.trim();
    this.wordChanged(this.word);
    this.handleLookUpHistory(this.word);
  };

  public handleLookUpHistory(word: string): void {
    if (!this.definition) return;
    // Delete then re-add, so the word appears at the end again.
    // We do this, since a word could have been looked up at the start of a long look up session,
    // and the user could have forgotten about it.
    // this.lookUpHistory.delete(word);
    this.lookUpHistory.add(word);
    this.lookUpHistory = new Set(this.lookUpHistory);
  }

  public calculateAboveHeaderHeight(): void {
    window.setTimeout(() => {
      const heightString = window.getComputedStyle(
        this.lookUpHistoryContainerRef,
      ).height;
      const height = getValueFromPixelString(heightString);
      const adjusted = height + 8; // + 8: give margin
      this.aboveHeaderTop = adjusted;
    }, 0);
  }
}
