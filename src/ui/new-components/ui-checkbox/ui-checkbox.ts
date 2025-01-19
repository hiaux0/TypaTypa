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
    aria-checked.bind="checked"
    aria-disabled.bind="disabled"
    tabindex="0"
    role="checkbox"
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

  attached() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  detached() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      this.toggleChecked();
    }
  };

  private toggleChecked() {
    if (!this.disabled) {
      this.checked = !this.checked;
    }
  }
}
