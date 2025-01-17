import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const popoverVariants = cva(
  "relative inline-block",
  {
    variants: {
      position: {
        top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
        left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      },
    },
    defaultVariants: {
      position: "top",
    },
  },
);

const template = `
  <div class="relative inline-block">
    <div class="popover-content" class.bind="popoverClass">
      <au-slot></au-slot>
    </div>
    <div class="popover-text" class.bind="popoverTextClass">
      \${text}
    </div>
  </div>
`;

@customElement({
  name: "ui-popover",
  template,
})
export class UiPopover {
  @bindable() text: string = "";
  @bindable() position: "top" | "bottom" | "left" | "right" = "top";

  public get popoverClass() {
    return popoverVariants({ position: this.position });
  }

  public get popoverTextClass() {
    return "absolute bg-gray-700 text-white text-xs rounded py-1 px-2 z-10";
  }
}
