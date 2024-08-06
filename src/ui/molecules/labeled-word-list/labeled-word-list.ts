import { bindable } from "aurelia";
import "./labeled-word-list.scss";
import { LabeledWordsData } from "../../../types";

export class LabeledWordList {
  @bindable() label = "";
  @bindable() words: string[] = [];
  @bindable() customWords: LabeledWordsData[] = [];
  @bindable() highlightWord = "";
  @bindable() seperator = ",";
  @bindable() shouldSort = false;
  @bindable() debug = false;
  @bindable() onWordClicked: (word: string) => void = () => {};
  public finalLabel = "";

  wordsChanged() {
    if (this.shouldSort) {
      this.words = this.words.sort();
    }
  }

  attached() {
    this.wordsChanged();

    if (this.label) {
      this.finalLabel = `${this.label}: `;
    }
  }

  public shouldHighlightWord(word: string): boolean {
    const same = this.highlightWord.toLowerCase() === word.toLowerCase();
    return same;
  }
}
