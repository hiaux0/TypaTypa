import { bindable } from "aurelia";
import "./labeled-word-list.scss";

export class LabeledWordList {
  public message = "labeled-word-list.html";

  @bindable() label = "";
  @bindable() words = [];
  @bindable() onWordClicked: (word: string) => void = () => {};
}
