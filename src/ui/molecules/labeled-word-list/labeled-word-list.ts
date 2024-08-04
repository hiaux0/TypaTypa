import { bindable } from "aurelia";
import "./labeled-word-list.scss";

export class LabeledWordList {
  @bindable() label = "";
  @bindable() words: string[] = [];
  @bindable() seperator = ",";
  @bindable() shouldSort = false;
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
}
