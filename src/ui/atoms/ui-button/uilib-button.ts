import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const buttonStyles = cva(
  "px-4 py-2 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75",
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white hover:bg-blue-700 focus:ring-blue-400",
        secondary:
          "bg-gray-500 text-white hover:bg-gray-700 focus:ring-gray-400",
        success:
          "bg-green-500 text-white hover:bg-green-700 focus:ring-green-400",
        danger: "bg-red-500 text-white hover:bg-red-700 focus:ring-red-400"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

const template = `
  <template>
    <button
      type.bind="type"
      disabled.bind="disabled"
      click.trigger="handleClick()"
      class.bind="buttonClass">
        \${label}
    </button>
  </template>
`;

@customElement({
  name: "uilib-button",
  template
})
export class UilibButton {
  @bindable() label: string = "Button";
  @bindable() type: string = "button";
  @bindable() disabled: boolean = false;
  @bindable() click: () => void;
  @bindable() variant: "primary" | "secondary" | "success" | "danger" =
    "primary";

  get buttonClass() {
    return buttonStyles({ variant: this.variant });
  }

  handleClick() {
    if (this.click && !this.disabled) {
      this.click();
    }
  }
}
