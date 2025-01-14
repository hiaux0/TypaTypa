// ui-popover
import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";
import { onOutsideClick } from "../../../common/modules/htmlElements";

const adjust = 5;
const popoverVariants = cva();

const template = `
<div ref="host" class="relative inline-block text-left" data-position.bind="position">
  <button ref="trigger" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
    <au-slot name="trigger"></au-slot>
  </button>
  <div ref="content" class="hidden absolute mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" style.bind="contentPosition">
    <au-slot name="content"></au-slot>
  </div>
</div>
`;

@customElement({
  name: "ui-popover",
  template,
})
export class UiPopover {
  @bindable() host: HTMLElement;
  @bindable() isOpen: boolean = true;
  @bindable() position: string = "bottom-right";

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
        return `top: 100%; left: ${this.width + adjust}px; margin-top: 0.5rem;`;
      case "bottom":
        return `top: 100%; left: 50%; transform: translateX(-50%); margin-top: 0.5rem;`;
      default:
        return `top: 100%; right: 0; margin-top: 0.5rem;`;
    }
  }

  attached() {
    this.content.classList.toggle("hidden", !this.isOpen);
    this.width = this.host.offsetWidth;
    this.height = this.host.offsetHeight;

    this.trigger.addEventListener("click", () => {
      this.toggle();
    });

    onOutsideClick(this.host, () => {
      this.close();
    });
  }

  private close = (): void => {
    this.isOpen = false;
    this.content.classList.toggle("hidden", !this.isOpen);
  };

  private toggle = (): void => {
    this.isOpen = !this.isOpen;
    this.content.classList.toggle("hidden", !this.isOpen);
  };
}
