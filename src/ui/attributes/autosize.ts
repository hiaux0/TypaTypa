import { INode, resolve } from "aurelia";

export class AutosizeCustomAttribute {
  private element = resolve(INode) as HTMLElement;
  constructor() {
    const adjustValue = 10;
    window.setTimeout(() => {
      this.element.style.height = "1px";
      this.element.style.height =
        adjustValue + this.element.scrollHeight + "px";
    }, 0);
    //this.element.style.width = this.element.style.height = "100px";
    //this.element.style.backgroundColor = "red";
    this.element.addEventListener("keyup", () => {
      this.element.style.height = "1px";
      this.element.style.height =
        adjustValue + this.element.scrollHeight + "px";
    });
  }
}
