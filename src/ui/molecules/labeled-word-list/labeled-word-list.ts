import { bindable } from "aurelia";
import "./labeled-word-list.scss";
import { LabeledWordsData } from "../../../types";

export class LabeledWordList {
  @bindable() label = "";
  @bindable() words: string[] = [];
  @bindable() customWords: LabeledWordsData[] = [];
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
    if (this.debug) {
      /*prettier-ignore*/ console.log("[labeled-word-list.ts,22] this.customWords: ", this.customWords);
    }
    this.wordsChanged();

    if (this.label) {
      this.finalLabel = `${this.label}: `;
    }
  }
}
