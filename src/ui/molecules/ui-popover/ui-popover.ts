// ui-popover
import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const popoverVariants = cva();

const template = `
  <template>
    <div class="relative inline-block text-left">
      <button ref="trigger" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <slot name="trigger"></slot>
      </button>
      <div ref="content" class="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
        <slot name="content"></slot>
      </div>
    </div>
  </template>
`;

@customElement({
  name: "ui-popover",
  template
})
export class UiPopover {
  @bindable() isOpen: boolean = false;
  trigger: any;
  content: any;

  attached() {
    this.trigger.addEventListener("click", () => {
      this.isOpen = !this.isOpen;
      this.content.classList.toggle("hidden", !this.isOpen);
    });
  }
}
