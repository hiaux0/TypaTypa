import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const dialogVariants = cva(
  "fixed inset-0 flex items-center justify-center z-50",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
      },
      backdrop: {
        default: "bg-black bg-opacity-50",
        none: "",
      },
    },
    defaultVariants: {
      size: "md",
      backdrop: "default",
    },
  },
);

const template = `
  <div class.bind="dialogClass" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
    <div class="bg-white rounded-lg shadow-lg p-4">
      <au-slot></au-slot>
    </div>
  </div>
`;

@customElement({
  name: "ui-dialog",
  template,
})
export class UiDialog {
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() backdrop: "default" | "none" = "default";

  public get dialogClass() {
    return dialogVariants({ size: this.size, backdrop: this.backdrop });
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
