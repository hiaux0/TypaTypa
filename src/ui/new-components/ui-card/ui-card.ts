import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg shadow-md overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const template = `
  <div class.bind="cardClass" tabindex="0" role="region" aria-label="Card">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-card",
  template,
})
export class UiCard {
  @bindable() variant: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get cardClass() {
    return cardVariants({ variant: this.variant });
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
