import { bindable } from "aurelia";
import "./dictionary.scss";
import { getDefinition } from "../../../modules/dictionary";
import { DictionaryLookUp } from "../../../types";

export class Dictionary {
  @bindable() public word = "";
  public message = "dictionary.html";
  public definition: DictionaryLookUp | undefined = undefined;

  wordChanged(newWord: string): void {
    this.definition = getDefinition(newWord);
    /*prettier-ignore*/ console.log("[dictionary.ts,13] this.definition: ", this.definition);
  }

  attached() {
    this.wordChanged(this.word);
  }

  public lookUp = (word: string): void => {
    this.word = word;
    this.wordChanged(word);
  }
}
