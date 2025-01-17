import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const separatorVariants = cva(
  "border-t border-gray-200",
  {
    variants: {
      color: {
        default: "border-gray-200",
        primary: "border-primary-500",
        secondary: "border-secondary-500",
        destructive: "border-destructive-500",
      },
    },
    defaultVariants: {
      color: "default",
    },
  },
);

const template = `
  <div class.bind="separatorClass">
    <au-slot></au-slot>
  </div>
`;

@customElement({
  name: "ui-separator",
  template,
})
export class UiSeparator {
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get separatorClass() {
    return separatorVariants({ color: this.color });
  }
}
