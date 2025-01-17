import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const toggleVariants = cva(
  "relative inline-flex items-center h-6 rounded-full w-11",
  {
    variants: {
      color: {
        default: "bg-gray-200",
        primary: "bg-primary-600",
        secondary: "bg-secondary-600",
        destructive: "bg-destructive-600",
      },
    },
    defaultVariants: {
      color: "default",
    },
  },
);

const template = `
  <div class.bind="toggleClass">
    <input
      type="checkbox"
      class="sr-only"
      checked.bind="checked"
      disabled.bind="disabled"
    />
    <div
      class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"
      class.bind="dotClass"
    ></div>
  </div>
`;

@customElement({
  name: "ui-toggle",
  template,
})
export class UiToggle {
  @bindable() checked: boolean = false;
  @bindable() disabled: boolean = false;
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get toggleClass() {
    return toggleVariants({ color: this.color });
  }

  public get dotClass() {
    return this.checked ? "translate-x-full" : "";
  }
}
