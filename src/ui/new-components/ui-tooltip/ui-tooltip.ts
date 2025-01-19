import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const tooltipVariants = cva(
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
    <div class="tooltip-content" class.bind="tooltipClass">
      <au-slot></au-slot>
    </div>
    <div class="tooltip-text" class.bind="tooltipTextClass">
      \${text}
    </div>
  </div>
`;

@customElement({
  name: "ui-tooltip",
  template,
})
export class UiTooltip {
  @bindable() text: string = "";
  @bindable() position: "top" | "bottom" | "left" | "right" = "top";

  public get tooltipClass() {
    return tooltipVariants({ position: this.position });
  }

  public get tooltipTextClass() {
    return "absolute bg-gray-700 text-white text-xs rounded py-1 px-2 z-10";
  }
}
