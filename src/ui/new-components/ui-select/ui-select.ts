import { bindable, customElement } from "aurelia";
import { cva } from "class-variance-authority";

const selectVariants = cva(
  "block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      color: {
        default: "bg-white",
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-secondary-100 text-secondary-800",
        destructive: "bg-destructive-100 text-destructive-800",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  },
);

const template = `
  <select class.bind="selectClass" value.bind="value" disabled.bind="disabled">
    <template repeat.for="option of options">
      <option value.bind="option.value">\${option.label}</option>
    </template>
  </select>
`;

@customElement({
  name: "ui-select",
  template,
})
export class UiSelect {
  @bindable() options: { label: string; value: string }[] = [];
  @bindable() value: string = "";
  @bindable() disabled: boolean = false;
  @bindable() size: "sm" | "md" | "lg" = "md";
  @bindable() color: "default" | "primary" | "secondary" | "destructive" =
    "default";

  public get selectClass() {
    return selectVariants({ size: this.size, color: this.color });
  }
}
