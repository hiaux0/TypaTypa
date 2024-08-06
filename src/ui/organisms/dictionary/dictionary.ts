import { bindable } from "aurelia";
import "./dictionary.scss";
import { getDefinition } from "../../../modules/dictionary";
import {
  DictionaryLookUp,
  LabeledWordsData,
  WordMeaning,
  WordType,
} from "../../../types";
import { getValueFromPixelString } from "../../../modules/strings";

export class Dictionary {
  @bindable() public word = "";
  @bindable() public lookUpHistory: string[] = [];
  public internalLookUpHistory = new Map<string, LabeledWordsData>([]);
  public lookUpHistoryContainerRef: HTMLElement = null;
  public finalWord = "";
  public searchValue: string | undefined = undefined;
  public definition: DictionaryLookUp | undefined = undefined;
  // /*prettier-ignore*/ public lookUpHistory = new Set<string>(["applying", "apply", "more", "word", "go", "here", "therefore", "important", "timewise", "ashtashtsahtshshtashashtshtshaaaaaaatshtt"]);
  public wordType: WordType | undefined = undefined;
  public meanings: WordMeaning[] = [];
  public aboveHeaderTop = 0;

  wordChanged(newWord: string): void {
    if (!newWord) return;
    const definition = getDefinition(newWord);
    this.handleLookUpHistory(this.word, definition);
    if (!definition) return;
    this.finalWord = newWord;
    this.definition = definition;
    if (Object.keys(this.definition?.MEANINGS ?? {}).length > 0) {
      this.meanings = Object.values(this.definition.MEANINGS);
    } else {
      this.meanings = [];
    }
    this.calculateAboveHeaderHeight();
  }

  attached() {
    this.initInternalLookUpHistory();

    this.calculateAboveHeaderHeight();
    this.wordChanged(this.word);
  }

  public initInternalLookUpHistory(): void {
    this.lookUpHistory;
    const updatedLookUpHistory = new Map<string, LabeledWordsData>();
    this.lookUpHistory.forEach((word) => {
      const definition = getDefinition(word);
      const result: LabeledWordsData = { word, disabled: !definition };
      updatedLookUpHistory.set(word, result);
    });
    this.internalLookUpHistory = new Map([
      ...Array.from(this.internalLookUpHistory),
      ...Array.from(updatedLookUpHistory),
    ]);
  }

  public lookUp = (word: string | undefined): void => {
    if (!word) return;
    this.word = word?.trim();
    this.wordChanged(this.word);
  };

  public searchOnKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key !== "Enter") return;
    this.lookUp(this.searchValue);
  }

  public handleLookUpHistory(word: string, definition: DictionaryLookUp): void {
    // Delete then re-add, so the word appears at the end again.
    // We do this, since a word could have been looked up at the start of a long look up session,
    // and the user could have forgotten about it.
    this.internalLookUpHistory.set(word, {
      word,
      disabled: !definition,
    });
    this.internalLookUpHistory = new Map(this.internalLookUpHistory);
  }

  public calculateAboveHeaderHeight(): void {
    window.setTimeout(() => {
      const heightString = window.getComputedStyle(
        this.lookUpHistoryContainerRef,
      ).height;
      const height = getValueFromPixelString(heightString);
      const adjusted = height + 22; // + 22: give margin
      this.aboveHeaderTop = adjusted;
    }, 0);
  }
}
