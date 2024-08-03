import { bindable } from "aurelia";
import "./dictionary.scss";
import { getDefinition } from "../../../modules/dictionary";

export class Dictionary {
  @bindable() public word = "";
  public message = "dictionary.html";

  wordChanged(newWord: string): void {
    const definition = getDefinition(newWord);
    /*prettier-ignore*/ console.log("[my-app.ts,78] definition: ", definition);
  }

  attached() {
    this.wordChanged(this.word);
  }
}
