import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const labelVariants = cva(
  "inline-flex items-center gap-2 text-sm font-medium",
  {
    variants: {
      color: {
        default: "text-gray-700",
        primary: "text-primary-700",
        secondary: "text-secondary-700",
        destructive: "text-destructive-700",
      },
    },
    defaultVariants: {
      color: "default",
    },
  },
);

const template = `
  <label class.bind="labelClass">
    <au-slot></au-slot>
  </label>
`;

@customElement({
  name: "ui-label",
  template,
})
export class UiLabel {
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get labelClass() {
    return labelVariants({ color: this.color });
  }
}
