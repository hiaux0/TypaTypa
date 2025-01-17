import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const hoverCardVariants = cva(
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
    <div class="hover-card-content" class.bind="hoverCardClass">
      <au-slot></au-slot>
    </div>
    <div class="hover-card-text" class.bind="hoverCardTextClass">
      \${text}
    </div>
  </div>
`;

@customElement({
  name: "ui-hover-card",
  template,
})
export class UiHoverCard {
  @bindable() text: string = "";
  @bindable() position: "top" | "bottom" | "left" | "right" = "top";

  public get hoverCardClass() {
    return hoverCardVariants({ position: this.position });
  }

  public get hoverCardTextClass() {
    return "absolute bg-gray-700 text-white text-xs rounded py-1 px-2 z-10";
  }
}
