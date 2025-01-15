// ui-popover
import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";
import { onOutsideClick } from "../../../common/modules/htmlElements";

const adjust = 5;
const popoverVariants = cva();

const template = `
<div-ui-popover
  ref="uiPopoverRef"
  class="relative inline-block text-left"
  data-position.bind="position"
>
  <button
    if.bind="!host"
    ref="trigger"
    class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    <au-slot name="trigger"></au-slot>
  </button>
  <div
    ref="content"
    class="
      \${isOpen ? 'hidden' : ''}
      absolute w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none
    "
    style.bind="contentPosition"
  >
    <au-slot name="content"></au-slot>
  </div>
</div-ui-popover
`;

@customElement({
  name: "ui-popover",
  template,
  containerless: true,
})
export class UiPopover {
  @bindable() host: HTMLElement;
  @bindable() isOpen: boolean = true;
  @bindable() position: string = "bottom-right";

  public uiPopoverRef: HTMLElement;
  public trigger: HTMLElement;
  public content: HTMLElement;
  public width: number;
  public height: number;

  public get contentPosition() {
    switch (this.position) {
      case "top-left":
        return `bottom: 100%; left: 0; margin-bottom: 0.5rem;`;
      case "top-right":
        return `bottom: 100%; right: 0; margin-bottom: 0.5rem;`;
      case "top":
        return `bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 0.5rem;`;
      case "bottom-left":
        return `top: 100%; left: 0; margin-top: 0.5rem;`;
      case "bottom-right":
        return `top: 100%; left: ${this.width + adjust}px;`;
      case "bottom":
        return `top: 100%; left: 50%; transform: translateX(-50%); margin-top: 0.5rem;`;
      default:
        return `top: 100%; right: 0; margin-top: 0.5rem;`;
    }
  }

  attached() {
    const finalElement = this.host ?? this.uiPopoverRef;
    /*prettier-ignore*/ console.log("[ui-popover.ts,70] this.host: ", this.host);
    this.width = finalElement.offsetWidth;
    /*prettier-ignore*/ console.log("[ui-popover.ts,73] this.width: ", this.width);
    this.height = finalElement.offsetHeight;
    /*prettier-ignore*/ console.log("[ui-popover.ts,75] this.height: ", this.height);

    this.trigger?.addEventListener("click", () => {
      this.toggle();
    });

    onOutsideClick(this.host, () => {
      this.close();
    });
  }

  private close = (): void => {
    this.isOpen = false;
    // this.content?.classList.toggle("hidden", !this.isOpen);
  };

  private toggle = (): void => {
    this.isOpen = !this.isOpen;
    // this.content?.classList.toggle("hidden", !this.isOpen);
  };
}
