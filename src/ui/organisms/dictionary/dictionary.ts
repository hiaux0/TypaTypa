import { bindable } from "aurelia";
import "./dictionary.scss";
import { getDefinition } from "../../../modules/dictionary";
import { DictionaryLookUp, WordMeaning, WordType } from "../../../types";

export class Dictionary {
  @bindable() public word = "";
  public searchValue = "";
  public definition: DictionaryLookUp | undefined = undefined;
  public lookUpHistory = new Set<string>(["applying", "apply"]);
  public wordType: WordType | undefined = undefined;
  public meanings: WordMeaning[] = [];

  wordChanged(newWord: string): void {
    if (!newWord) return;
    this.definition = getDefinition(newWord);
    /*prettier-ignore*/ console.log("[dictionary.ts,13] this.definition: ", this.definition);
    if (Object.keys(this.definition?.MEANINGS ?? {}).length > 0) {
      this.meanings = Object.values(this.definition.MEANINGS);
    } else {
      this.meanings = [];
    }
  }

  attached() {
    this.wordChanged(this.word);
  }

  public lookUp = (word: string): void => {
    this.word = word.trim();
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
}
