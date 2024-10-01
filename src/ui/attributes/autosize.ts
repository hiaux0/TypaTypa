import { INode, bindable, resolve } from "aurelia";
import { getElementStyleAsNumber } from "../../common/modules/htmlElements";

export class AutosizeCustomAttribute {
  @bindable widthStep: number = 0;
  @bindable heightStep: number = 0;
  @bindable onWidthAutosize: (newWidth: number) => void;
  @bindable onHeightAutosize: (newHeight: number) => void;
  /**
   * Pad value, when autosize is applied
   */
  @bindable padding = 8;

  private element = resolve(INode) as HTMLElement;
  private initialWidth = 0;
  private initialHeight = 0;

  constructor() {
    const adjustHeight = 2 + this.padding;
    const adjustWidth = 15 + this.padding;
    window.setTimeout(() => {
      this.initialWidth = getElementStyleAsNumber(this.element, "width");
      this.initialHeight = getElementStyleAsNumber(this.element, "height");
      // this.element.style.height = "1px";
      //this.element.style.height =
      //  adjustValue + this.element.scrollHeight + "px";
    }, 66);

    this.element.addEventListener("keydown", () => {
      // Width
      this.element.style.width = this.initialWidth + "px";
      let newWidth = this.initialWidth;
      if (this.element.scrollWidth > this.initialWidth) {
        if (this.widthStep !== 0) {
          const factor = Math.ceil(this.element.scrollWidth / this.widthStep);
          newWidth = this.widthStep * factor;
        } else {
          newWidth = this.widthStep + adjustWidth + this.element.scrollWidth;
        }
      }
      this.element.style.width = newWidth + "px";
      this.onWidthAutosize?.(newWidth);

      // Height
      this.element.style.height = this.initialHeight + "px";
      let newHeight = this.initialHeight;
      if (this.element.scrollHeight > this.initialHeight) {
        if (this.heightStep !== 0) {
          const factor = Math.ceil(this.element.scrollHeight / this.heightStep);
          newHeight = this.heightStep * factor;
        } else {
          newHeight =
            this.heightStep + adjustHeight + this.element.scrollHeight;
        }
      }
      this.element.style.height = newHeight + "px";
      this.onHeightAutosize?.(newHeight);
    });
  }
}
