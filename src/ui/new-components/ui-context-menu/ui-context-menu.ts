import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const contextMenuVariants = cva(
  "absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg",
  {
    variants: {
      size: {
        sm: "w-32",
        md: "w-48",
        lg: "w-64",
      },
      position: {
        top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
        left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      },
    },
    defaultVariants: {
      size: "md",
      position: "bottom",
    },
  },
);

const template = `
  <div class.bind="contextMenuClass" tabindex="0" role="menu" aria-label="Context Menu">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-context-menu",
  template,
})
export class UiContextMenu {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() position: "top" | "bottom" | "left" | "right" = "bottom";

  public get contextMenuClass() {
    return contextMenuVariants({ size: this.size, position: this.position });
  }

  attached() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  detached() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.close();
    }
  };

  private close() {
    // Implement close functionality
  }
}
