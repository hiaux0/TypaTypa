import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const avatarVariants = cva(
  "inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16",
      },
      color: {
        default: "bg-gray-100",
        primary: "bg-primary-100",
        secondary: "bg-secondary-100",
        destructive: "bg-destructive-100",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  },
);

const template = `
  <div class.bind="avatarClass" tabindex="0" role="img" aria-label.bind="alt">
    <img src.bind="src" alt.bind="alt" class="h-full w-full object-cover" />
  </div>
`;

@customElement({
  name: "ui-avatar",
  template,
})
export class UiAvatar {
  @bindable() src: string = "";
  @bindable() alt: string = "Avatar";
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get avatarClass() {
    return avatarVariants({ size: this.size, color: this.color });
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
