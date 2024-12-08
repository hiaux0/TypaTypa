import Aurelia, { IAurelia, resolve } from "aurelia";
import "./playground.scss";

export class Playground {
  public message = "playground.html";
  public inputRef: HTMLElement;
  public itemsRef: HTMLElement;
  public items: string[] = ["hi"];

  constructor(private au = resolve(IAurelia)) {}

  attached() {
    document.addEventListener("keydown", (e) => {
      const key = e.key;
      if (key === "a") {
        this.addElement();
      }
    });
    this.itemsRef.innerHTML =
      '<test-component text.bind="item" repeat.for="item of items"></test-component>';

    this.au.enhance({
      component: { items: this.items, item: "ha" },
      host: this.itemsRef,
    });
  }

  public addElement() {
    // const itemList = document.getElementById("item-list");
    // this.itemsRef = "<bold text.bind='item'></bold>"
    // const $boldItem = document.createElement("bold");
    // $boldItem.innerHTML = '<bold text.bind="item"></bold>';

    const random = Math.random().toString(36).substring(7);
    /*prettier-ignore*/ console.log("[playground.ts,29] random: ", random);
    this.items.push(random);
    //this.au.enhance({
    //  component: { itemsHa: this.items },
    //  host: this.itemsRef,
    //});
  }
}
