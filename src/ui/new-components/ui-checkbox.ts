import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const checkboxVariants = cva(
  "form-checkbox h-4 w-4 text-primary-600 transition duration-150 ease-in-out",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const template = `
  <input
    type="checkbox"
    class.bind="checkboxClass"
    checked.bind="checked"
    disabled.bind="disabled"
  />
`;

@customElement({
  name: "ui-checkbox",
  template,
})
export class UiCheckbox {
  @bindable() checked: boolean = false;
  @bindable() disabled: boolean = false;
  @bindable() size: "sm" | "md" | "lg" = "md";

  public get checkboxClass() {
    return checkboxVariants({ size: this.size });
  }
}
